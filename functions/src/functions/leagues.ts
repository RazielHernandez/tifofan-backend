import {onRequest} from "firebase-functions/v2/https";
import {SUPPORTED_LEAGUES} from "../constants/leagues";

/**
 * Returns all supported leagues with metadata.
 *
 * @example
 * GET /getSupportedLeagues
 */
export const getSupportedLeagues = onRequest((_req, res): void => {
  res.json(Object.values(SUPPORTED_LEAGUES));
});
