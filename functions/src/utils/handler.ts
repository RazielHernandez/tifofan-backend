import type {Request, Response} from "express";
import {fail} from "./httpResponses";

/**
 * Wraps an HTTPS function with centralized error handling.
 *
 * @param {Function} fn Function handler
 * @return {Function} Wrapped handler
 */
export function handler(
  fn:(req:Request, res:Response) => Promise<void>
):(req:Request, res:Response) => Promise<void> {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      fail(res, error);
    }
  };
}
