import {MatchTeamStatistics} from "../types/match";

/**
 * Normalizes match statistics for a single team.
 *
 * @param {any} raw Raw API-Football statistics entry
 * @return {MatchTeamStatistics} Normalized team statistics
 */
export function normalizeMatchStatistics(
  raw:any
):MatchTeamStatistics {
  if (!raw?.team || !Array.isArray(raw.statistics)) {
    throw new Error("Invalid match statistics response");
  }

  const stats:Record<string, number | string | null> = {};

  for (const item of raw.statistics) {
    stats[item.type] = item.value ?? null;
  }

  return {
    teamId: raw.team.id,
    teamName: raw.team.name,
    logo: raw.team.logo,
    stats,
  };
}
