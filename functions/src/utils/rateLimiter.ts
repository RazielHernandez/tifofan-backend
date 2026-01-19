import {ApiError} from "./apiError";

type RateEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateEntry>();

/**
 * Enforces rate limiting for a given key within a specified time window.
 * @param {string} key - The identifier for the rate limit bucket
 * @param {number} limit - Maximum number of requests allowed per window
 * @param {number} windowMs - Time window in milliseconds for the rate limit
 * @throws Error with code "rate_limited" when the limit is exceeded
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    // const error = new Error("Too many requests") as Error & {
    //   code: string;
    //   status: number;
    //   retryAfter: number;
    // };
    const error = new ApiError(
      429, "rate_limited", "Too many requests", retryAfter);
    // error.code = "rate_limited";
    // error.status = 429;
    // error.retryAfter = retryAfter;
    throw error;
  }

  entry.count += 1;
}
