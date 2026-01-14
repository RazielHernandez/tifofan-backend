import {PlayerSeasonStats} from "../types/player";
import {PlayerSeasonAggregates} from "../types/playerSeasonAggregates";

/**
 * Aggregate an array of PlayerSeasonStats into season-level aggregates.
 *
 * @param {PlayerSeasonStats[]} stats - array of PlayerSeasonStats to aggregate.
 * @return {PlayerSeasonAggregates} season-level aggregated stats.
 */
export function aggregatePlayerSeasonStats(
  stats: PlayerSeasonStats[]
): PlayerSeasonAggregates {
  const acc = {
    appearances: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    ratingSum: 0,
    ratingCount: 0,
  };

  for (const s of stats) {
    acc.appearances += s.appearances;
    acc.minutes += s.minutes;
    acc.goals += s.goals;
    acc.assists += s.assists;
    acc.yellowCards += s.yellowCards;
    acc.redCards += s.redCards;

    if (s.rating !== null) {
      acc.ratingSum += s.rating;
      acc.ratingCount += 1;
    }
  }

  return {
    appearances: acc.appearances,
    minutes: acc.minutes,
    goals: acc.goals,
    assists: acc.assists,
    yellowCards: acc.yellowCards,
    redCards: acc.redCards,

    averageRating: acc.ratingCount ?
      Number((acc.ratingSum / acc.ratingCount).toFixed(2)) :
      null,

    goalsPer90: acc.minutes ?
      Number(((acc.goals / acc.minutes) * 90).toFixed(2)) :
      0,

    assistsPer90: acc.minutes ?
      Number(((acc.assists / acc.minutes) * 90).toFixed(2)) :
      0,
  };
}
