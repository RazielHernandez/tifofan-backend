import type {Response} from "express";

interface Meta {
  cached?: boolean;
  timestamp?: number;
  pagination?: {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems?: number;
  };
}

/**
 * Sends a standardized API response.
 *
 * @template T - Type of the response data.
 * @param {Response} res - Express response object.
 * @param {T} data - Payload to send in the response.
 * @param {Meta} [meta] - Optional metadata for the response.
 */
export function ok<T>(
  res: Response,
  data: T,
  meta: Meta = {}
): void {
  res.json({
    data,
    meta: {
      timestamp: Math.floor(Date.now() / 1000),
      ...meta,
    },
  });
}
