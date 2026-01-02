import {NormalizedPlayerStats} from "../types/player";

/**
 * Normalizes API-Football player statistics object.
 *
 * @param {any}stats Raw statistics object from API-Football.
 * @return {NormalizedPlayerStats} Normalized player statistics.
 */
export function normalizePlayerStats(stats:any):NormalizedPlayerStats {
  if (!stats || !stats.team || !stats.league) {
    throw new Error("Invalid player statistics response");
  }

  return {
    teamId: stats.team.id,
    teamName: stats.team.name,
    teamLogo: stats.team.logo,

    leagueId: stats.league.id,
    leagueName: stats.league.name,
    season: stats.league.season,

    appearances: stats.games?.appearences ?? 0,
    minutes: stats.games?.minutes ?? 0,
    position: stats.games?.position ?? "",
    rating: stats.games?.rating ? Number(stats.games.rating) : null,

    goals: stats.goals?.total ?? 0,
    assists: stats.goals?.assists ?? 0,

    passes: stats.passes?.total ?? 0,
    passAccuracy: stats.passes?.accuracy ? Number(stats.passes.accuracy) : null,

    yellowCards: stats.cards?.yellow ?? 0,
    redCards: stats.cards?.red ?? 0,
  };
}
