interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

/**
 * Simple in-memory rate limiter
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = store[identifier];

  // No record or window expired
  if (!record || now > record.resetAt) {
    store[identifier] = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  // Increment count
  record.count++;

  if (record.count > MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
    resetAt: record.resetAt,
  };
}
