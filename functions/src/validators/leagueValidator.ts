import {SUPPORTED_LEAGUES} from "../constants/leagues";
import {ApiError} from "../utils/apiError";

/**
 * Validates that a league is supported.
 *
 * @param {number} league League ID
 * @return {void}
 * @throws {ApiError} When league is unsupported
 */
export function validateLeague(league: number): void {
  if (!SUPPORTED_LEAGUES[league]) {
    throw new ApiError(
      400,
      "unsupported_league",
      `League ${league} is not supported`
    );
  }
}
