import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";

import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
import {buildCacheKey} from "../cache/cacheKeys";
import {CACHE_TTL} from "../cache/cacheConfig";
import {normalizeTeam} from "../normalizers/teamNormalizer";
import {normalizeTeamStats} from "../normalizers/teamStatsNormalizer";
import {normalizeTeamPlayer} from "../normalizers/teamPlayersNormalizer";
import {Team, TeamCore} from "../types/team";
import {handler} from "../utils/handler";
import {getNumberParam} from "../utils/queryHelpers";
import {ok} from "../utils/response";
import {aggregateTeamSeasonStats} from "../aggregators/teamSeassonAgregates";
const API_FOOTBALL_KEY = defineSecret("API_FOOTBALL_KEY");

/* -------------------------------------------------------------------------- */
/*                                   Teams                                    */
/* -------------------------------------------------------------------------- */

/**
 * Returns basic team information.
 *
 * @example
 * GET /getTeam?id=33
 */
export const getTeam = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  handler(async (req, res) => {
    const teamId = getNumberParam(req.query.id, "id");

    // const cacheKey = `team_${teamId}`;
    const cacheKey = buildCacheKey("team", teamId);
    const cached = await getCached(cacheKey);
    if (cached) {
      // res.json(cached);
      ok(res, cached, {cached: true});
      return;
    }

    const raw: any = await fetchFromApiFootball(
      "teams",
      {id: teamId},
      API_FOOTBALL_KEY.value()
    );

    if (!raw.response?.length) {
      throw new Error("Empty match response");
    }

    const normalized: Team = normalizeTeam(raw.response[0]);
    // res.json(normalized);
    // await setCached(cacheKey, normalized, 86400);
    await setCached(cacheKey, normalized, CACHE_TTL.team);
    // res.json(normalized);
    ok(res, normalized, {cached: false});
  })
);

/**
 * Returns team statistics by league and season.
 *
 * @example
 * GET /getTeamDetails?team=33&league=39&season=2024
 */
export const getTeamDetails = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  handler(async (req, res) => {
    const teamId = getNumberParam(req.query.team, "team");
    const leagueId = getNumberParam(req.query.league, "league");
    const season = getNumberParam(req.query.season, "season");

    const cacheKey = buildCacheKey("teamDetails", teamId, leagueId, season);
    const cached = await getCached(cacheKey);
    if (cached) {
      ok(res, cached, {cached: true});
      return;
    }

    // Fetch raw statistics
    const raw: any = await fetchFromApiFootball(
      "teams/statistics",
      {team: teamId, league: leagueId, season},
      API_FOOTBALL_KEY.value()
    );

    if (!raw.response) {
      throw new Error("Empty team statistics response");
    }

    const teamDataRaw = raw.response.team;
    if (!teamDataRaw?.id || !teamDataRaw?.name) {
      throw new Error("Invalid team data in statistics response");
    }

    // Build TeamCore object
    const teamCore: TeamCore = {
      id: teamDataRaw.id,
      name: teamDataRaw.name,
      logo: teamDataRaw.logo ?? null,
      country: teamDataRaw.country ?? null,
    };

    // // Normalize team stats using TeamCore
    // const normalized = normalizeTeamStats(
    //   raw.response,
    //   teamCore,
    //   leagueId,
    //   season
    // );

    // await setCached(cacheKey, normalized, CACHE_TTL.teamDetails);

    // ok(res, normalized, {cached: false});

    const stats = normalizeTeamStats(
      raw.response,
      teamCore,
      leagueId,
      season
    );

    const aggregates = aggregateTeamSeasonStats(stats);

    const response = {
      team: teamCore,
      leagueId,
      season,
      stats,
      aggregates,
    };

    await setCached(cacheKey, response, CACHE_TTL.teamDetails);

    ok(res, response, {cached: false});
  })
);


/**
 * Returns players of a team for a given season.
 *
 * @example
 * GET /getTeamPlayers?team=33&season=2024
 */
export const getTeamPlayers = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  handler(async (req, res)=>{
    const team = getNumberParam(req.query.team, "team");
    const league = getNumberParam(req.query.league, "league");
    const season = getNumberParam(req.query.season, "season");
    const page =
      getNumberParam(req.query.page, "page") ?? 1;

    const cacheKey = buildCacheKey(
      "teamPlayers",
      team,
      league,
      season,
      `page_${page}`
    );

    const cached = await getCached<{
      data:any[];
      pagination:{
        page:number;
        perPage:number;
        totalPages:number;
        hasNext:boolean;
      };
    }>(cacheKey);

    if (cached) {
      ok(res, cached.data, {
        cached: true,
        pagination: cached.pagination,
      });
      return;
    }

    const raw: any = await fetchFromApiFootball(
      "players",
      {team, league, season, page},
      API_FOOTBALL_KEY.value()
    );

    const players = raw.response.map(normalizeTeamPlayer);

    const perPage = Number(
      raw.paging.per_page ?? raw.paging.perPage ?? raw.paging.limit ?? 0
    );

    const pagination = {
      page: Number(raw.paging.current),
      perPage,
      totalPages: Number(raw.paging.total),
      hasNext: Number(raw.paging.current) < Number(raw.paging.total),
    };

    await setCached(
      cacheKey,
      {data: players, pagination},
      CACHE_TTL.teamPlayers
    );

    ok(res, players, {
      cached: false,
      pagination,
    });
  })
);

export type MatchResult = "W" | "D" | "L";

/**
 * Derives a team's recent form string from matches, e.g. "WWDL".
 *
 * @param {Match[]} matches Array of results with home/away goals and team ids.
 * @param {Team} teamId Team id to compute form for.
 * @param {Number} limit Number of recent matches to include (default 5).
 * @return {String} of results with "W", "D", "L".
 */
export function deriveTeamForm(
  matches: {
    homeTeamId: number;
    awayTeamId: number;
    homeGoals: number;
    awayGoals: number;
  }[],
  teamId: number,
  limit = 5
): string {
  return matches
    .slice(-limit)
    .map((m) => {
      const isHome = m.homeTeamId === teamId;
      const goalsFor = isHome ? m.homeGoals : m.awayGoals;
      const goalsAgainst = isHome ? m.awayGoals : m.homeGoals;
      if (goalsFor > goalsAgainst) return "W";
      if (goalsFor < goalsAgainst) return "L";
      return "D";
    })
    .join("");
}
