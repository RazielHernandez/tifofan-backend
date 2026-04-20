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
  const team: TeamCore = {
    id: raw?.team?.id ?? 0,
    name: raw?.team?.name ?? "Unknown",
    logo: raw?.team?.logo ?? "",
  };

  const statisticsArray = Array.isArray(raw?.statistics) ?
    raw.statistics : [];

  const stats: Record<string, number | null> = {};

  for (const item of statisticsArray) {
    try {
      const key = STAT_MAP[item?.type];
      if (!key) continue;

      const value = item?.value;

      if (typeof value === "string" && value.endsWith("%")) {
        stats[key] = Number(value.replace("%", "")) || 0;
      } else if (typeof value === "number") {
        stats[key] = value;
      } else {
        stats[key] = null;
      }
    } catch (err) {
      console.warn("⚠️ Stat parse error:", item);
      continue;
    }
  }

  return {
    team,
    stats,
  };
}
// export function normalizeMatchStatistics(
//   raw: any
// ): MatchTeamStatistics {
//   if (!raw?.team || !Array.isArray(raw.statistics)) {
//     throw new Error("Invalid match statistics response");
//   }

//   const team: TeamCore = {
//     id: raw.team.id,
//     name: raw.team.name,
//     logo: raw.team.logo,
//   };

//   const stats: Record<string, number | null> = {};

//   for (const item of raw.statistics) {
//     const key = STAT_MAP[item.type];
//     if (!key) continue;

//     if (typeof item.value === "string" && item.value.endsWith("%")) {
//       stats[key] = Number(item.value.replace("%", ""));
//     } else {
//       stats[key] = item.value ?? null;
//     }
//   }

//   return {
//     team,
//     stats,
//   };
// }

