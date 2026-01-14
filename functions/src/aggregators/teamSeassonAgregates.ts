import {TeamStats} from "../types/teamStats";
import {TeamSeasonAggregates} from "../types/teamSeassonAggregates";

/**
 * Aggregate team season statistics into summary metrics.
 * @param {TeamStats} stats containing fixtures and goals
 * @return {TeamSeasonAggregates} aggregated season statistics
 */
export function aggregateTeamSeasonStats(
  stats: TeamStats
): TeamSeasonAggregates {
  const played = stats.fixtures.played;

  return {
    matchesPlayed: played,
    wins: stats.fixtures.wins,
    draws: stats.fixtures.draws,
    losses: stats.fixtures.losses,

    winRate: played ?
      Number(((stats.fixtures.wins / played) * 100).toFixed(1)) :
      0,

    points:
      stats.fixtures.wins * 3 +
      stats.fixtures.draws,

    goalsFor: stats.goals.for,
    goalsAgainst: stats.goals.against,

    goalDifference: stats.goals.for - stats.goals.against,

    goalsForPerMatch: played ?
      Number((stats.goals.for / played).toFixed(2)) :
      0,

    goalsAgainstPerMatch: played ?
      Number((stats.goals.against / played).toFixed(2)) :
      0,
  };
}
