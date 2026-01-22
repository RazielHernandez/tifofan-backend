import type {Response} from "express";
import * as logger from "firebase-functions/logger";
import {ApiError} from "./apiError";

/**
 * Sends a successful JSON response wrapper.
 *
 * @template T
 * @param {T} data - Response data
 * @param {Object} [options] - Options for response
 * @param {boolean} [options.cached] - Cached flag
 * @param {{
 *   page: number,
 *   totalPages: number,
 *   hasNext: boolean
 * }} [options.pagination] - Pagination info
 * @return {Object} Response object
 */
export function ok<T>(
  data: T,
  options?: {
    cached?: boolean;
    pagination?: {
      page: number;
      totalPages: number;
      hasNext: boolean;
    };
  }
) {
  return {
    data,
    meta: {
      cached: options?.cached ?? false,
      timestamp: Date.now(),
    },
    ...(options?.pagination ? {pagination: options.pagination} : {}),
  };
}

/**
 * Centralized error response handler.
 *
 * @param {Response} res Express response
 * @param {unknown} error Thrown error
 */
export function fail(res:Response, error:unknown):void {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  logger.error("Unhandled error", error);

  res.status(500).json({
    error: {
      code: "internal_error",
      message: "Internal server error",
    },
  });
}
