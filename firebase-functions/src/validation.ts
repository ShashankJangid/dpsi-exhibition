import * as crypto from 'crypto';
import { RawVotePayload, ValidatedVoteInput } from './types';

export const IP_HASH_SALT = 'dpsi_salt_2026';

const PROJECT_ID_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;
const FINGERPRINT_REGEX = /^[a-zA-Z0-9_\-+=:.]{8,128}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface ValidationSuccess {
  isValid: true;
  data: ValidatedVoteInput;
}

export interface ValidationFailure {
  isValid: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates the raw vote request body against the strict anti-cheat schema.
 */
export function validateVotePayload(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      error: 'Request body must be a valid JSON object.',
    };
  }

  const payload = body as RawVotePayload;

  // 1. Validate projectId
  if (typeof payload.projectId !== 'string') {
    return {
      isValid: false,
      error: 'Missing or invalid projectId. Must be a non-empty string.',
    };
  }
  const projectId = payload.projectId.trim().toLowerCase();
  if (!PROJECT_ID_REGEX.test(projectId)) {
    return {
      isValid: false,
      error: 'Invalid projectId format. Must be 1-50 alphanumeric characters, hyphens, or underscores.',
    };
  }

  // 2. Validate fingerprint / deviceFingerprint
  const rawFingerprint =
    typeof payload.deviceFingerprint === 'string'
      ? payload.deviceFingerprint
      : typeof payload.fingerprint === 'string'
      ? payload.fingerprint
      : null;

  if (!rawFingerprint) {
    return {
      isValid: false,
      error: 'Missing or invalid device fingerprint. Expected "fingerprint" or "deviceFingerprint" as a string.',
    };
  }

  // Normalize slashes (from standard base64 fallback) to underscores for safe Firestore document ID paths
  const deviceFingerprint = rawFingerprint.split('/').join('_').trim();
  if (!FINGERPRINT_REGEX.test(deviceFingerprint)) {
    return {
      isValid: false,
      error: 'Invalid device fingerprint. Must be between 8 and 128 characters.',
    };
  }

  // 3. Validate userId
  if (typeof payload.userId !== 'string') {
    return {
      isValid: false,
      error: 'Missing or invalid userId. Must be a non-empty string.',
    };
  }
  const userId = payload.userId.trim();
  if (userId.length === 0 || userId.length > 128) {
    return {
      isValid: false,
      error: 'Invalid userId. Must be between 1 and 128 characters.',
    };
  }

  // 4. Validate userEmail (optional)
  let userEmail: string | null = null;
  if (payload.userEmail !== undefined && payload.userEmail !== null) {
    if (typeof payload.userEmail !== 'string') {
      return {
        isValid: false,
        error: 'Invalid userEmail. Must be a valid email string or null.',
      };
    }
    const trimmedEmail = payload.userEmail.trim();
    if (trimmedEmail.length > 0) {
      if (trimmedEmail.length > 128 || !EMAIL_REGEX.test(trimmedEmail)) {
        return {
          isValid: false,
          error: 'Invalid userEmail format.',
        };
      }
      userEmail = trimmedEmail.toLowerCase();
    }
  }

  return {
    isValid: true,
    data: {
      projectId,
      deviceFingerprint,
      userId,
      userEmail,
    },
  };
}

/**
 * Extracts the real client IP address from request headers or socket.
 */
export function extractClientIp(req: {
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
}): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    // If multiple proxy IPs are present in comma-separated list, the first one is the client IP
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp.length > 0) return firstIp;
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    const firstIp = String(forwarded[0]).split(',')[0].trim();
    if (firstIp.length > 0) return firstIp;
  }

  const realIp = req.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim().length > 0) {
    return realIp.trim();
  }

  const fastlyIp = req.headers?.['fastly-client-ip'];
  if (typeof fastlyIp === 'string' && fastlyIp.trim().length > 0) {
    return fastlyIp.trim();
  }

  if (req.ip && typeof req.ip === 'string' && req.ip.trim().length > 0) {
    return req.ip.trim();
  }

  if (req.socket?.remoteAddress && typeof req.socket.remoteAddress === 'string') {
    return req.socket.remoteAddress.trim();
  }

  return '127.0.0.1';
}

/**
 * Generates a privacy-preserving salted SHA-256 hash of the client IP address.
 */
export function hashClientIp(ip: string, salt: string = IP_HASH_SALT): string {
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}
