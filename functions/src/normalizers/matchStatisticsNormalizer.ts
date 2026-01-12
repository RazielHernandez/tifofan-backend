import {MatchTeamStatistics} from "../types/match";
import {TeamCore} from "../types/team";
import {STAT_MAP} from "../constants/stats";

/**
 * Normalizes match statistics for a single team.
 *
 * @param {any} raw Raw API-Football statistics entry
 * @return {MatchTeamStatistics} Normalized team statistics
 */
export function normalizeMatchStatistics(
  raw: any
): MatchTeamStatistics {
  if (!raw?.team || !Array.isArray(raw.statistics)) {
    throw new Error("Invalid match statistics response");
  }

  const team: TeamCore = {
    id: raw.team.id,
    name: raw.team.name,
    logo: raw.team.logo,
  };

  const stats: Record<string, number | null> = {};

  for (const item of raw.statistics) {
    const key = STAT_MAP[item.type];
    if (!key) continue;

    if (typeof item.value === "string" && item.value.endsWith("%")) {
      stats[key] = Number(item.value.replace("%", ""));
    } else {
      stats[key] = item.value ?? null;
    }
  }

  return {
    team,
    stats,
  };
}
