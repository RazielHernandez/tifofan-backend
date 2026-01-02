import {NormalizedPlayer} from "../types/player";
import {normalizePlayerStats} from "./playerStatsNormalizer";

/**
 * Normalizes a team player from API-Football.
 *
 * @param {any} item Raw API-Football player object.
 * @return {Player} Normalized player.
 */
export function normalizeTeamPlayer(item: any): NormalizedPlayer {
  if (!item || !item.player) {
    throw new Error("Invalid player response");
  }

  return {
    id: item.player.id,
    name: item.player.name,
    age: item.player.age,
    nationality: item.player.nationality,
    photo: item.player.photo,

    stats: Array.isArray(item.statistics) ?
      item.statistics.map(normalizePlayerStats) : [],
  };
}
