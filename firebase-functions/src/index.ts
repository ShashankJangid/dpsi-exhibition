import * as admin from 'firebase-admin';
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { validateVotePayload, extractClientIp, hashClientIp } from './validation';
import { ipRateLimiter, compositeRateLimiter } from './rateLimiter';
import { executeVoteTransaction, VoteServiceError } from './voteService';

// Initialize Firebase Admin singleton if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Cloud Functions v2 HTTP Vote Handler.
 * Supports CORS, strictly validates input payload, enforces school Wi-Fi rate limiting
 * (300 req/min IP flood ceiling + 10 req/min per ipHash:deviceFingerprint composite key),
 * and executes atomic Firestore transactions preventing double-voting.
 */
export const vote = onRequest(
  {
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    // 1. Handle HTTP preflight and method constraints
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed. Only POST requests are supported.`,
      });
      return;
    }

    try {
      // 2. Extract and hash client IP address
      const clientIp = extractClientIp(req);
      const ipHash = hashClientIp(clientIp);

      // 3. Volumetric raw IP rate limit check (300 req/min per IP hash flood ceiling)
      const ipLimit = ipRateLimiter.check(ipHash);
      if (!ipLimit.allowed) {
        if (ipLimit.retryAfterSeconds) {
          res.setHeader('Retry-After', String(ipLimit.retryAfterSeconds));
        }
        res.status(429).json({
          success: false,
          message: 'Too many requests from this network. Please wait before submitting another vote.',
        });
        return;
      }

      // 4. Schema validation
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        try {
          bodyData = JSON.parse(bodyData);
        } catch {
          res.status(400).json({
            success: false,
            message: 'Invalid JSON request body.',
          });
          return;
        }
      }

      const validation = validateVotePayload(bodyData);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.error,
        });
        return;
      }

      // 4.5 Verify Firebase OAuth ID Token
      const rawAuth = req.headers.authorization;
      const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
      let hasVerifiedToken = false;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.slice(7).trim();
        if (idToken) {
          try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            // Cryptographically bind vote to the verified OAuth identity
            validation.data.userId = decoded.uid;
            validation.data.userEmail = decoded.email ? decoded.email.toLowerCase() : null;
            hasVerifiedToken = true;
          } catch (tokenErr) {
            console.warn('Firebase ID token verification failed:', tokenErr);
            res.status(401).json({
              success: false,
              message: 'Invalid or expired authentication token. Please sign in again.',
            });
            return;
          }
        }
      }

      // Enforce cryptographic identity: registered user accounts MUST supply a valid token
      // Unauthenticated callers are strictly restricted to guest pass credentials (guest_*)
      if (!hasVerifiedToken && !validation.data.userId.startsWith('guest_')) {
        res.status(401).json({
          success: false,
          message: 'Authentication token required for registered user accounts. Please sign in.',
        });
        return;
      }

      // 5. Composite device rate limiting (10 req/min per device fingerprint on this IP)
      const compositeKey = `${ipHash}:${validation.data.deviceFingerprint}`;
      const deviceLimit = compositeRateLimiter.check(compositeKey);
      if (!deviceLimit.allowed) {
        if (deviceLimit.retryAfterSeconds) {
          res.setHeader('Retry-After', String(deviceLimit.retryAfterSeconds));
        }
        res.status(429).json({
          success: false,
          message: 'Too many requests from this device. Please wait before submitting another vote.',
        });
        return;
      }

      // 6. Execute atomic Firestore transaction
      const result = await executeVoteTransaction(db, validation.data, ipHash);

      res.status(200).json(result);
    } catch (err) {
      if (err instanceof VoteServiceError) {
        if (err.statusCode === 409) {
          res.status(409).json({
            success: false,
            alreadyVoted: true,
            message: err.message,
          });
          return;
        }

        res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
        return;
      }

      console.error('Unhandled vote processing error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error recording vote.',
      });
    }
  }
);

/**
 * Cloud Functions v2 Callable Vote Handler (for direct Firebase Client SDK invocation).
 */
export const voteCallable = onCall(
  {
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    const rawReq = request.rawRequest;
    const clientIp = extractClientIp(rawReq);
    const ipHash = hashClientIp(clientIp);

    // Raw IP rate limiting (300 req/min flood ceiling)
    const ipLimit = ipRateLimiter.check(ipHash);
    if (!ipLimit.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        'Too many requests from this network. Please wait before submitting another vote.'
      );
    }

    // Schema validation
    const validation = validateVotePayload(request.data);
    if (!validation.isValid) {
      throw new HttpsError('invalid-argument', validation.error);
    }

    // Cryptographically bind to verified OAuth identity if authenticated via Firebase SDK
    if (request.auth) {
      validation.data.userId = request.auth.uid;
      validation.data.userEmail = request.auth.token.email ? request.auth.token.email.toLowerCase() : null;
    } else if (!validation.data.userId.startsWith('guest_')) {
      throw new HttpsError(
        'unauthenticated',
        'Authentication required for registered user accounts. Please sign in.'
      );
    }

    // Composite device rate limiting (10 req/min)
    const compositeKey = `${ipHash}:${validation.data.deviceFingerprint}`;
    const deviceLimit = compositeRateLimiter.check(compositeKey);
    if (!deviceLimit.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        'Too many requests from this device. Please wait before submitting another vote.'
      );
    }

    try {
      return await executeVoteTransaction(db, validation.data, ipHash);
    } catch (err) {
      if (err instanceof VoteServiceError) {
        if (err.statusCode === 409) {
          throw new HttpsError('already-exists', err.message);
        }
        if (err.statusCode === 404) {
          throw new HttpsError('not-found', err.message);
        }
      }
      console.error('Unhandled voteCallable error:', err);
      throw new HttpsError('internal', 'Internal server error recording vote.');
    }
  }
);

/**
 * Health check endpoint for deployment verification and uptime monitoring.
 */
export const healthCheck = onRequest({ cors: true }, (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'dpsi-voting-functions-v2',
    timestamp: new Date().toISOString(),
  });
});

// Re-export modules for consumers, tests, and modular architecture
export * from './types';
export * from './validation';
export * from './rateLimiter';
export * from './voteService';
