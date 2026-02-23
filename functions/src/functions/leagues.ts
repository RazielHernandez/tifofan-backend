import {onRequest, onCall} from "firebase-functions/v2/https";
import {SUPPORTED_LEAGUES} from "../constants/leagues";
// import {ApiError} from "../utils/apiError";

/**
 * Returns all supported leagues with metadata.
 *
 * @example
 * GET /getSupportedLeagues
 */
export const getSupportedLeagues = onRequest((_req, res): void => {
  res.json(Object.values(SUPPORTED_LEAGUES));
});


export const getSupportedLeaguesCallable = onCall((request) => {
  /* if (!request.auth) {
    // throw new HttpsError("unauthenticated", "Login required");
    throw new ApiError(request.auth ? 403 : 401,
      "unauthenticated",
      "Login required");
  } */
  return Object.values(SUPPORTED_LEAGUES);
});
