export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export interface RateLimiterOptions {
  windowMs?: number; // default: 60,000 ms (1 minute)
  maxRequests?: number; // default: 60 requests per minute
  maxKeys?: number; // default: 10,000 keys to avoid memory leaks
}

/**
 * Sliding Window In-Memory Rate Limiter.
 * Provides volumetric rate limiting (default: 60 req/min/IP) to protect against DoS attacks
 * while permitting normal shared Wi-Fi NAT traffic at school exhibition venues.
 */
export class SlidingWindowRateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxKeys: number;
  private records: Map<string, number[]>;
  private lastCleanup: number;

  constructor(options: RateLimiterOptions = {}) {
    this.windowMs = options.windowMs ?? 60 * 1000;
    this.maxRequests = options.maxRequests ?? 60;
    this.maxKeys = options.maxKeys ?? 10000;
    this.records = new Map<string, number[]>();
    this.lastCleanup = Date.now();
  }

  public check(key: string, now: number = Date.now()): RateLimitResult {
    this.maybeCleanup(now);

    const windowStart = now - this.windowMs;
    const timestamps = this.records.get(key) || [];

    // Filter to retain only timestamps inside the current sliding window
    const activeTimestamps = timestamps.filter((t) => t > windowStart);

    if (activeTimestamps.length >= this.maxRequests) {
      const oldestActive = activeTimestamps[0];
      const timeUntilExpiry = oldestActive + this.windowMs - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(timeUntilExpiry / 1000));
      this.records.set(key, activeTimestamps);

      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    // Record this request
    activeTimestamps.push(now);
    this.records.set(key, activeTimestamps);

    // Hard ceiling FIFO eviction: if new key pushed size over maxKeys, prune oldest
    if (this.records.size > this.maxKeys) {
      const oldest = this.records.keys().next().value;
      if (oldest) {
        this.records.delete(oldest);
      }
    }

    return {
      allowed: true,
      remaining: this.maxRequests - activeTimestamps.length,
    };
  }

  public reset(): void {
    this.records.clear();
    this.lastCleanup = Date.now();
  }

  public getRecordCount(): number {
    return this.records.size;
  }

  private maybeCleanup(now: number): void {
    if (now - this.lastCleanup > this.windowMs) {
      const windowStart = now - this.windowMs;
      for (const [key, timestamps] of this.records.entries()) {
        const active = timestamps.filter((t) => t > windowStart);
        if (active.length === 0) {
          this.records.delete(key);
        } else {
          this.records.set(key, active);
        }
      }
      this.lastCleanup = now;
    }
  }
}

// Global raw IP flood ceiling (300 req/min) so 300+ attendees on school Wi-Fi NAT aren't locked out
export const ipRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 300, // 300 requests per minute raw IP flood ceiling
});

// Composite device rate limiter (10 req/min) keyed on ${ipHash}:${deviceFingerprint}
export const compositeRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute per device on a given IP
  maxKeys: 50000,
});

/**
 * Composite rate limit check helper for school Wi-Fi NAT environments.
 * Checks the raw IP ceiling (300 req/min) followed by the composite key `${ipHash}:${deviceFingerprint}` (10 req/min).
 */
export function checkCompositeRateLimit(
  ipHash: string,
  deviceFingerprint: string,
  now: number = Date.now()
): RateLimitResult {
  // 1. Check raw IP flood limit (300 req/min)
  const ipCheck = ipRateLimiter.check(ipHash, now);
  if (!ipCheck.allowed) {
    return ipCheck;
  }

  // 2. Check composite device limit (10 req/min)
  const compositeKey = `${ipHash}:${deviceFingerprint}`;
  return compositeRateLimiter.check(compositeKey, now);
}

/**
 * Reset both singleton rate limiters (useful for testing and maintenance).
 */
export function resetRateLimiters(): void {
  ipRateLimiter.reset();
  compositeRateLimiter.reset();
}
