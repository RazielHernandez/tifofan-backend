import type {Response} from "express";
import * as logger from "firebase-functions/logger";
import {ApiError} from "./apiError";

/**
 * Sends a successful JSON response.
 *
 * @template T
 * @param {Response} res Express response
 * @param {T} data Response data
 */
export function ok<T>(res:Response, data:T):void {
  res.status(200).json({data});
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
