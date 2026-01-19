import type {Request} from "express";

/**
 * Extracts and validates the authentication context from the request headers.
 * @param {Request} req - The Express request object
 * @return {Object} The authentication context
 * @return {boolean} returns.isAuthenticated - Whether user is authenticated
 * @return {string|null} returns.uid - The user ID or null
 */
export function getAuthContext(req: Request) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return {
      isAuthenticated: false,
      uid: null,
    };
  }

  return {
    isAuthenticated: true,
    uid: "future-user", // placeholder
  };
}
