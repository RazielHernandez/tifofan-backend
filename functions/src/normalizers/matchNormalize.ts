import {NormalizedMatch} from "../types/match";
import {NormalizedMatchDetails} from "../types/match";

/**
 * Normalizes a match response from API-Football.
 *
 * @param {any} fixture Raw API-Football team item.
 * @return {NormalizedMatch} Normalized team.
 */
export function normalizeMatch(fixture: any): NormalizedMatch {
  if (!fixture?.fixture || !fixture?.teams) {
    throw new Error("Invalid match response");
  }

  return {
    id: fixture.fixture.id,
    leagueId: fixture.league.id,
    season: fixture.league.season,
    date: fixture.fixture.date,
    status: fixture.fixture.status.short,
    homeTeam: {
      id: fixture.teams.home.id,
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
      goals: fixture.goals.home,
    },
    awayTeam: {
      id: fixture.teams.away.id,
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
      goals: fixture.goals.away,
    },
  };
}


/**
 * Normalizes a match detail response from API-Football.
 *
 * @param {any} fixture Raw API-Football team item.
 * @return {NormalizedMatchDetails} Normalized team.
 */
export function normalizeMatchDetails(fixture: any): NormalizedMatchDetails {
  const base = normalizeMatch(fixture);

  return {
    ...base,
    venue: fixture.fixture.venue?.name,
    referee: fixture.fixture.referee,
    halftimeScore: fixture.score?.halftime ?
      `${fixture.score.halftime.home}-${fixture.score.halftime.away}` :
      undefined,
    fulltimeScore: fixture.score?.fulltime ?
      `${fixture.score.fulltime.home}-${fixture.score.fulltime.away}` :
      undefined,
  };
}
