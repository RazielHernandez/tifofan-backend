import {onRequest, onCall} from "firebase-functions/v2/https";
import {SUPPORTED_LEAGUES} from "../constants/leagues";
import {buildResponse} from "../utils/response";
// import {ApiError} from "../utils/apiError";

/**
 * Returns all supported leagues with metadata.
 *
 * @example
 * GET /getSupportedLeagues
 */
export const getSupportedLeagues = onRequest((_req, res): void => {
  // res.json(Object.values(SUPPORTED_LEAGUES));
  buildResponse(Object.values(SUPPORTED_LEAGUES));
});

/**
 * Returns all supported leagues with metadata.
 *
 * @example
 * GET /getSupportedLeagues
 */
export const getSupportedLeaguesCallable = onCall((request) => {
  /* if (!request.auth) {
    // throw new HttpsError("unauthenticated", "Login required");
    throw new ApiError(request.auth ? 403 : 401,
      "unauthenticated",
      "Login required");
  } */
  // return Object.values(SUPPORTED_LEAGUES);
  return buildResponse(Object.values(SUPPORTED_LEAGUES));
});
