import type {Request} from "express";
import {getAuthContext} from "./authContext";

/**
 * Resolves rate limit config based on authentication status and endpoint.
 * @param {Request} req - The Express request object
 * @param {string} endpoint - The endpoint name
 * @return {Object} Object containing rate limit key, limit, and window duration
 */
export function resolveRateLimit(
  req: Request,
  endpoint: string
) {
  const auth = getAuthContext(req);
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";

  // Defaults
  let limit = 20;
  const windowMs = 60_000; // 1 minute

  // Expensive endpoints
  if (["getMatches", "getTeamPlayers", "getPlayer"].includes(endpoint)) {
    limit = 10;
  }

  // Authenticated users get higher limits
  if (auth.isAuthenticated) {
    limit *= 5;
  }

  const key = auth.isAuthenticated ?
    `${endpoint}:user:${auth.uid}` :
    `${endpoint}:ip:${ip}`;

  return {key, limit, windowMs};
}
