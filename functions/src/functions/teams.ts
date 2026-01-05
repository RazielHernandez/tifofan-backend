import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";

import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
import {buildCacheKey} from "../cache/cacheKeys";
import {CACHE_TTL} from "../cache/cacheConfig";
import {normalizeTeam} from "../normalizers/teamNormalizer";
import {normalizeTeamStats} from "../normalizers/teamStatsNormalizer";
import {normalizeTeamPlayer} from "../normalizers/teamPlayersNormalizer";
import {Team} from "../types/team";
import {handler} from "../utils/handler";
import {getNumberParam} from "../utils/queryHelpers";

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
      res.json(cached);
      return;
    }

    const raw = await fetchFromApiFootball(
      "teams",
      {id: teamId},
      API_FOOTBALL_KEY.value()
    );

    const normalized: Team = normalizeTeam(raw[0]);
    // res.json(normalized);
    // await setCached(cacheKey, normalized, 86400);
    await setCached(cacheKey, normalized, CACHE_TTL.team);
    res.json(normalized);
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
    const team = getNumberParam(req.query.team, "team");
    const league = getNumberParam(req.query.league, "league");
    const season = getNumberParam(req.query.season, "season");

    // const cacheKey = `team_stats_${team}_${league}_${season}`;
    const cacheKey = buildCacheKey("teamDetails", team, league, season);
    const cached = await getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const raw = await fetchFromApiFootball(
      "teams/statistics",
      {team, league, season},
      API_FOOTBALL_KEY.value()
    );

    const normalized = normalizeTeamStats(
      raw,
      team,
      league,
      season
    );

    // await setCached(cacheKey, normalized, 24 * 60 * 60);
    await setCached(cacheKey, normalized, CACHE_TTL.teamDetails);
    res.json(normalized);
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
  handler(async (req, res) => {
    const team = getNumberParam(req.query.team, "team");
    const league = getNumberParam(req.query.league, "league");
    const season = getNumberParam(req.query.season, "season");

    // const cacheKey = `team_players_${team}_${league}_${season}`;
    const cacheKey = buildCacheKey("teamPlayers", team, league, season);
    const cached = await getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const raw = await fetchFromApiFootball(
      "players",
      {team, league, season},
      API_FOOTBALL_KEY.value()
    );

    const players = raw.map(normalizeTeamPlayer);
    // await setCached(cacheKey, players, 12 * 60 * 60);
    await setCached(cacheKey, players, CACHE_TTL.teamPlayers);
    res.json(players);
  })
);
