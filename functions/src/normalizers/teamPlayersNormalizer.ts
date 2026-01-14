import {
  PlayerWithSeasonStats,
  PlayerSeasonStats,
} from "../types/player";
import {normalizeTeamCore} from "./teamNormalizer";

/**
 * Normalizes a team player from API-Football.
 *
 * @param {any} item Raw API-Football player object.
 * @return {PlayerWithSeasonStats} Normalized player with season stats.
 */
export function normalizeTeamPlayer(item: any): PlayerWithSeasonStats {
  if (!item?.player?.id || !item?.player?.name) {
    throw new Error("Invalid team player response");
  }

  return {
    id: item.player.id,
    name: item.player.name,
    photo: item.player.photo ?? undefined,
    age: item.player.age ?? undefined,
    nationality: item.player.nationality ?? undefined,

    stats: Array.isArray(item.statistics) ?
      item.statistics.map(normalizePlayerSeasonStats) :
      [],
  };
}

/**
 * Normalizes player season statistics.
 *
 * @param {any} stats Raw API-Football statistics object.
 * @return {PlayerSeasonStats} Normalized season stats.
 */
export function normalizePlayerSeasonStats(stats: any): PlayerSeasonStats {
  if (!stats?.team || !stats?.league) {
    throw new Error("Invalid player season statistics response");
  }

  return {
    team: normalizeTeamCore(stats.team),

    leagueId: stats.league.id,
    leagueName: stats.league.name,
    season: stats.league.season,

    appearances: stats.games?.appearences ?? 0,
    minutes: stats.games?.minutes ?? 0,
    position: stats.games?.position ?? "",
    rating: stats.games?.rating ?
      Number(stats.games.rating) :
      null,

    goals: stats.goals?.total ?? 0,
    assists: stats.goals?.assists ?? 0,

    passes: stats.passes?.total ?? 0,
    passAccuracy: stats.passes?.accuracy ?
      Number(stats.passes.accuracy) :
      null,

    yellowCards: stats.cards?.yellow ?? 0,
    redCards: stats.cards?.red ?? 0,
  };
}
