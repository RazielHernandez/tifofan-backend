import {SUPPORTED_LEAGUES} from "../constants/leagues";
import {ApiError} from "../utils/apiError";

/**
 * Validates season for a league.
 *
 * @param {number} league League ID
 * @param {number} season Season year
 */
export function validateSeason(league: number, season: number): void {
  const leagueMeta = SUPPORTED_LEAGUES[league];

  if (!leagueMeta) return;

  if (season < leagueMeta.fromSeason) {
    throw new ApiError(
      400,
      "invalid_season",
      `Season ${season} is not supported for ${leagueMeta.name}`
    );
  }
}
