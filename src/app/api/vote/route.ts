import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface StoredVoteRecord {
  projectId: string;
  userId: string;
  deviceFingerprint: string;
  userEmail: string | null;
  ipHash: string;
  timestamp: number;
}

// In-memory sliding-window rate limit tracker for school Wi-Fi NAT
const ipRateLimitWindow = new Map<string, number[]>();
const compositeRateLimitWindow = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const IP_FLOOD_MAX_REQUESTS = 300; // 300 req/min raw IP ceiling for school Wi-Fi NAT
const COMPOSITE_MAX_REQUESTS = 10; // 10 req/min per ipHash:deviceFingerprint

const PROJECT_ID_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;
const FINGERPRINT_REGEX = /^[a-zA-Z0-9_\-+=:.]{8,128}$/;

function checkRateLimit(
  storage: Map<string, number[]>,
  key: string,
  maxRequests: number
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (storage.get(key) || []).filter((t) => t > windowStart);

  // Periodic pruning of expired keys when storage grows beyond 1000 items to avoid memory leaks
  if (storage.size > 1000) {
    for (const [storedKey, tsList] of storage.entries()) {
      if (tsList.every((t) => t <= windowStart)) {
        storage.delete(storedKey);
      }
    }
  }

  if (timestamps.length >= maxRequests) {
    const oldestTimestamp = timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  storage.set(key, timestamps);
  return { allowed: true };
}

// Local serverless verified vote ledger
const localVotesLedger: StoredVoteRecord[] = [];

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { projectId, fingerprint, deviceFingerprint, userId, userEmail } = body as {
      projectId?: unknown;
      fingerprint?: unknown;
      deviceFingerprint?: unknown;
      userId?: unknown;
      userEmail?: unknown;
    };

    // 1. Strict Schema Validation
    if (typeof projectId !== 'string' || !projectId.trim() || projectId.length > 50) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid projectId (must be 1-50 characters).' },
        { status: 400 }
      );
    }
    const normalizedProjectId = projectId.trim().toLowerCase();
    if (!PROJECT_ID_REGEX.test(normalizedProjectId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid projectId format. Must be alphanumeric characters, hyphens, or underscores.' },
        { status: 400 }
      );
    }

    const rawFingerprint = typeof deviceFingerprint === 'string' ? deviceFingerprint : fingerprint;
    if (typeof rawFingerprint !== 'string' || rawFingerprint.trim().length < 8 || rawFingerprint.length > 128) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid hardware device fingerprint (minimum 8 characters).' },
        { status: 400 }
      );
    }
    const normalizedFingerprint = rawFingerprint.replace(/\//g, '_').trim();
    if (!FINGERPRINT_REGEX.test(normalizedFingerprint)) {
      return NextResponse.json(
        { success: false, message: 'Invalid device fingerprint format. Must be 8-128 valid characters.' },
        { status: 400 }
      );
    }

    if (typeof userId !== 'string' || !userId.trim() || userId.length > 128) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid userId (must be 1-128 characters).' },
        { status: 400 }
      );
    }

    const sanitizedEmail =
      typeof userEmail === 'string' && userEmail.trim()
        ? userEmail.trim().toLowerCase()
        : null;

    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid userEmail format.' },
        { status: 400 }
      );
    }

    // 2. Extract client IP and generate salted SHA-256 hash
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(clientIp + 'dpsi_salt_2026').digest('hex');

    // 3. Volumetric Rate Limiting for school Wi-Fi NAT
    // Check raw IP flood limit (300 req/min)
    const ipRateLimit = checkRateLimit(ipRateLimitWindow, ipHash, IP_FLOOD_MAX_REQUESTS);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests from this network. Please wait before submitting another vote.',
        },
        {
          status: 429,
          headers: ipRateLimit.retryAfterSeconds
            ? { 'Retry-After': String(ipRateLimit.retryAfterSeconds) }
            : undefined,
        }
      );
    }

    // Check composite device limit (10 req/min per ipHash:deviceFingerprint)
    const compositeKey = `${ipHash}:${normalizedFingerprint}`;
    const compositeRateLimit = checkRateLimit(compositeRateLimitWindow, compositeKey, COMPOSITE_MAX_REQUESTS);
    if (!compositeRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests from this device. Please wait before submitting another vote.',
        },
        {
          status: 429,
          headers: compositeRateLimit.retryAfterSeconds
            ? { 'Retry-After': String(compositeRateLimit.retryAfterSeconds) }
            : undefined,
        }
      );
    }

    // 4. Upstream Cloud Function Forwarding (if configured)
    const upstreamFunctionUrl =
      process.env.FIREBASE_FUNCTIONS_URL ||
      process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
      process.env.VOTE_FUNCTION_URL;

    if (upstreamFunctionUrl) {
      try {
        const upstreamHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-forwarded-for': clientIp,
        };

        const authHeader = req.headers.get('authorization');
        if (authHeader) {
          upstreamHeaders['authorization'] = authHeader;
        }

        const upstreamRes = await fetch(upstreamFunctionUrl, {
          method: 'POST',
          headers: upstreamHeaders,
          body: JSON.stringify({
            projectId: normalizedProjectId,
            deviceFingerprint: normalizedFingerprint,
            userId: userId.trim(),
            userEmail: sanitizedEmail,
          }),
        });

        const upstreamData = await upstreamRes.json().catch(() => ({}));
        return NextResponse.json(upstreamData, { status: upstreamRes.status });
      } catch (proxyErr) {
        console.warn('Upstream Cloud Function proxy notice, falling back to local handler:', proxyErr);
      }
    }

    // 5. Local Serverless Atomic Anti-Cheat Checks
    // Layer 2: Check Hardware Device Canvas Fingerprint Collision
    const hasDeviceVoted = localVotesLedger.some(
      (v) => v.projectId === normalizedProjectId && v.deviceFingerprint === normalizedFingerprint
    );

    if (hasDeviceVoted) {
      return NextResponse.json(
        {
          success: false,
          alreadyVoted: true,
          message: 'Anti-Cheat Alert: Hardware fingerprint collision detected. This device has already voted for this project.',
        },
        { status: 409 }
      );
    }

    // Layer 1: Check User Identity Collision
    const hasUserVoted = localVotesLedger.some(
      (v) => v.projectId === normalizedProjectId && v.userId === userId.trim()
    );

    if (hasUserVoted) {
      return NextResponse.json(
        {
          success: false,
          alreadyVoted: true,
          message: 'Duplicate Vote: Your user identity has already voted for this project.',
        },
        { status: 409 }
      );
    }

    // Prevent unbounded memory growth in long-running dev servers (FIFO cap at 10,000 records)
    if (localVotesLedger.length >= 10000) {
      localVotesLedger.splice(0, 1000);
    }

    // 6. Record Verified Vote in Local Ledger
    localVotesLedger.push({
      projectId: normalizedProjectId,
      userId: userId.trim(),
      deviceFingerprint: normalizedFingerprint,
      userEmail: sanitizedEmail,
      ipHash,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      edgePreflightOnly: true,
      persisted: false,
      message: 'Verified vote pre-flight recorded via multi-layer anti-cheat pipeline.',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('Vote API route error:', err);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
