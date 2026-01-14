import {TeamStats} from "../types/teamStats";
import {TeamCore} from "../types/team";

/**
 * Normalizes API-Football team statistics response.
 *
 * @param {any} item Raw API-Football team statistics object.
 * @param {TeamCore} team Team info (id, name, logo, country)
 * @param {number} league League ID.
 * @param {number} season Season year.
 * @return {TeamStats} Normalized team stats.
 */
export function normalizeTeamStats(
  item: any,
  team: TeamCore,
  league: number,
  season: number
): TeamStats {
  if (!item || typeof item !== "object") {
    throw new Error("Invalid team statistics response");
  }

  return {
    team,
    leagueId: league,
    season,
    form: item.form ?? null,
    fixtures: {
      played: item.fixtures?.played?.total ?? 0,
      wins: item.fixtures?.wins?.total ?? 0,
      draws: item.fixtures?.draws?.total ?? 0,
      losses: item.fixtures?.loses?.total ?? item.fixtures?.losses?.total ?? 0,
    },
    goals: {
      for: item.goals?.for?.total?.total ?? 0,
      against: item.goals?.against?.total?.total ?? 0,
    },
  };
}
