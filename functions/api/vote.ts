// Cloudflare Pages Function: /api/vote
// Executes serverless edge rate limiting, schema validation, and anti-cheat processing on Cloudflare Pages

type Env = Record<string, unknown>;

interface VotePayload {
  projectId?: unknown;
  fingerprint?: unknown;
  deviceFingerprint?: unknown;
  userId?: unknown;
  userEmail?: unknown;
}

const PROJECT_ID_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;
const FINGERPRINT_REGEX = /^[a-zA-Z0-9_\-+=:.]{8,128}$/;

// In-memory sliding-window edge rate limit cache
const edgeIpRateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const IP_FLOOD_MAX = 300; // 300 req/min raw IP ceiling

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (edgeIpRateLimits.get(ip) || []).filter((t) => t > windowStart);

  if (edgeIpRateLimits.size > 1000) {
    for (const [k, list] of edgeIpRateLimits.entries()) {
      if (list.every((t) => t <= windowStart)) {
        edgeIpRateLimits.delete(k);
      }
    }
  }

  if (timestamps.length >= IP_FLOOD_MAX) {
    return true;
  }

  timestamps.push(now);
  edgeIpRateLimits.set(ip, timestamps);
  return false;
}

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const clientIp = request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Too many requests from this network. Please wait a moment before trying again.',
        }),
        { status: 429, headers: corsHeaders }
      );
    }

    const body = (await request.json().catch(() => null)) as VotePayload | null;

    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON request payload.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { projectId, fingerprint, deviceFingerprint, userId, userEmail } = body;

    // 1. Validate projectId
    if (typeof projectId !== 'string' || !projectId.trim() || projectId.length > 50) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing or invalid projectId (must be 1-50 characters).' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedProjectId = projectId.trim().toLowerCase();
    if (!PROJECT_ID_REGEX.test(normalizedProjectId)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid projectId format.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Validate hardware fingerprint
    const rawFingerprint = typeof deviceFingerprint === 'string' ? deviceFingerprint : fingerprint;
    if (typeof rawFingerprint !== 'string' || rawFingerprint.trim().length < 8 || rawFingerprint.length > 128) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing or invalid hardware device fingerprint (minimum 8 characters).' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedFingerprint = rawFingerprint.replace(/\//g, '_').trim();
    if (!FINGERPRINT_REGEX.test(normalizedFingerprint)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid device fingerprint format.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Validate userId
    if (typeof userId !== 'string' || !userId.trim() || userId.length > 128) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing or invalid userId.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const sanitizedEmail = typeof userEmail === 'string' && userEmail.trim()
      ? userEmail.trim().toLowerCase()
      : null;

    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid userEmail format.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Edge receipt verification: Successful pre-flight and edge-level anti-cheat validation
    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        message: 'Ballot verified by Cloudflare Edge pipeline.',
        projectId: normalizedProjectId,
        deviceFingerprint: normalizedFingerprint,
        userId: userId.trim(),
        userEmail: sanitizedEmail,
        timestamp: Date.now(),
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal edge error';
    return new Response(
      JSON.stringify({ success: false, message: errorMsg }),
      { status: 500, headers: corsHeaders }
    );
  }
};
