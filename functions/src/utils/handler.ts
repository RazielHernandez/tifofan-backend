import {rateLimit} from "./rateLimiter";
import {resolveRateLimit} from "./rateLimitResolver";
import {ApiError} from "./apiError";

/**
 * Wraps an HTTPS function with centralized error handling and rate limiting.
 *
 * @param {Function} fn Function handler
 * @param {string} endpointName Optional endpoint name for rate limiting
 * @return {Function} Wrapped handler
 */
export function handler(
  fn: (req: any, res: any) => Promise<void>,
  endpointName?: string
) {
  return async (req: any, res: any) => {
    try {
      if (endpointName) {
        const {key, limit, windowMs} = resolveRateLimit(req, endpointName);
        // await rateLimit(req, endpointName);
        rateLimit(key, limit, windowMs);
      }

      await fn(req, res);
    } catch (err: any) {
      // ✅ Known API error (rate limit, validation, etc.)
      if (err instanceof ApiError) {
        res.status(err.status).json({
          error: {
            code: err.code,
            message: err.message,
            ...(err.retryAfter && {retryAfter: err.retryAfter}),
          },
        });
        return;
      }

      // ❌ Unknown error
      console.error("Unhandled error", err);
      res.status(500).json({
        error: {
          code: "internal_error",
          message: "Internal server error",
        },
      });
    }
  };
}
