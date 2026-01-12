import {NormalizedMatch, NormalizedMatchDetails} from "../types/match";
import {TeamCore} from "../types/team";

/**
 * Normalizes a match response from API-Football.
 *
 * @param {any} fixture Raw API-Football team item.
 * @return {NormalizedMatch} Normalized team.
 */
export function normalizeMatch(fixture: any): NormalizedMatch {
  if (
    !fixture?.fixture ||
    !fixture?.teams?.home ||
    !fixture?.teams?.away ||
    !fixture?.league
  ) {
    throw new Error("Invalid match response");
  }

  const homeTeam: TeamCore = {
    id: fixture.teams.home.id,
    name: fixture.teams.home.name,
    logo: fixture.teams.home.logo,
  };

  const awayTeam: TeamCore = {
    id: fixture.teams.away.id,
    name: fixture.teams.away.name,
    logo: fixture.teams.away.logo,
  };

  return {
    id: fixture.fixture.id,
    leagueId: fixture.league.id,
    season: fixture.league.season,
    date: fixture.fixture.date,
    status: fixture.fixture.status.short,

    home: {
      team: homeTeam,
      goals: fixture.goals?.home ?? null,
    },

    away: {
      team: awayTeam,
      goals: fixture.goals?.away ?? null,
    },
  };
}


/**
 * Normalizes a match detail response from API-Football.
 *
 * @param {any} fixture Raw API-Football team item.
 * @return {NormalizedMatchDetails} Normalized team.
 */
export function normalizeMatchDetails(
  fixture: any
): NormalizedMatchDetails {
  const base = normalizeMatch(fixture);

  return {
    ...base,
    venue: fixture.fixture.venue?.name ?? undefined,
    referee: fixture.fixture.referee ?? undefined,

    halftimeScore: fixture.score?.halftime ?
      `${fixture.score.halftime.home}-${fixture.score.halftime.away}` :
      undefined,

    fulltimeScore: fixture.score?.fulltime ?
      `${fixture.score.fulltime.home}-${fixture.score.fulltime.away}` :
      undefined,
  };
}
