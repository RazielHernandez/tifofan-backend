import {PlayerSeasonStats} from "../types/player";
import {TeamCore} from "../types/team";

/**
 * Normalizes API-Football player statistics object.
 *
 * @param {any} raw Raw statistics object from API-Football.
 * @return {NormalizedPlayerStats} Normalized player statistics.
 */
export function normalizePlayerSeasonStats(raw: any): PlayerSeasonStats {
  if (!raw?.team || !raw?.league) {
    throw new Error("Invalid player statistics response");
  }

  const team: TeamCore = {
    id: raw.team.id,
    name: raw.team.name,
    logo: raw.team.logo ?? null,
    country: raw.team.country ?? null,
  };

  return {
    team,

    leagueId: raw.league.id,
    leagueName: raw.league.name,
    season: raw.league.season,

    // Games
    appearances: raw.games?.appearences ?? 0,
    minutes: raw.games?.minutes ?? 0,
    position: raw.games?.position ?? "",
    rating: raw.games?.rating != null ?
      Number(raw.games.rating) :
      null,

    // Goals
    goals: raw.goals?.total ?? 0,
    assists: raw.goals?.assists ?? 0,

    // Passing
    passes: raw.passes?.total ?? 0,
    passAccuracy: raw.passes?.accuracy != null ?
      Number(raw.passes.accuracy) :
      null,

    // Discipline
    yellowCards: raw.cards?.yellow ?? 0,
    redCards: raw.cards?.red ?? 0,
  };
}
