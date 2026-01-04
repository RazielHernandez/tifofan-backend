import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";

import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
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

    const cacheKey = `team_${teamId}`;
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

    // const team = normalizeTeam(raw);
    // await setCached(cacheKey, team, 24 * 60 * 60);
    // res.json(team);

    const normalized: Team = normalizeTeam(raw[0]);
    res.json(normalized);
    await setCached(cacheKey, normalized, 86400);
    res.json(normalized);
  })
);

/* export const getTeam = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res): Promise<void> => {
    try {
      const teamId = getQueryNumber(req.query.id);
      if (!teamId) {
        res.status(400).json({error: "team id is required"});
        return;
      }

      const cacheKey = `team_${teamId}`;
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
      res.json(normalized);


      await setCached(cacheKey, normalized, 86400);
      res.json(normalized);
    } catch (error) {
      logger.error("getTeam error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
); */

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

    const cacheKey = `team_stats_${team}_${league}_${season}`;
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

    // const stats = normalizeTeamStatistics(raw);
    // await setCached(cacheKey, stats, 24 * 60 * 60);
    // res.json(stats);

    const normalized = normalizeTeamStats(
      raw,
      team,
      league,
      season
    );

    await setCached(cacheKey, normalized, 24 * 60 * 60);
    res.json(normalized);
  })
);

/* export const getTeamDetails = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res): Promise<void> => {
    try {
      const team = getQueryNumber(req.query.team);
      const league = getQueryNumber(req.query.league);
      const season = getQueryNumber(req.query.season);

      if (!team || !league || !season) {
        res.status(400).json({error: "team, league and season are required"});
        return;
      }

      const cacheKey = [
        "teamDetails",
        team,
        league,
        season,
      ].filter(Boolean).join("_");
      const cached = await getCached(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const data = await fetchFromApiFootball(
        "teams/statistics",
        {team, league, season},
        API_FOOTBALL_KEY.value()
      );

      if (!data || typeof data !== "object") {
        throw new Error("Invalid team statistics response");
      }

      const normalized = normalizeTeamStats(
        data,
        team,
        league,
        season
      );

      await setCached(cacheKey, normalized, 24 * 60 * 60);
      res.json(normalized);
    } catch (error) {
      logger.error("getTeamDetails error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
); */

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

    const cacheKey = `team_players_${team}_${league}_${season}`;
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

    // const players = normalizeTeamPlayers(raw);
    // await setCached(cacheKey, players, 12 * 60 * 60);
    // res.json(players);

    const players = raw.map(normalizeTeamPlayer);
    await setCached(cacheKey, players, 12 * 60 * 60);
    res.json(players);
  })
);

/* export const getTeamPlayers = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res): Promise<void> => {
    try {
      const team = getQueryNumber(req.query.team);
      const season = getQueryNumber(req.query.season);

      if (!team || !season) {
        res.status(400).json({error: "team and season are required"});
        return;
      }

      const cacheKey = `teamPlayers_${team}_${season}`;
      const cached = await getCached(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const data = await fetchFromApiFootball(
        "players",
        {team, season},
        API_FOOTBALL_KEY.value()
      );

      if (!Array.isArray(data)) {
        throw new Error("Invalid players response");
      }

      const normalized = data.map(normalizeTeamPlayer);

      await setCached(cacheKey, normalized, 12 * 60 * 60);
      res.json(normalized);
    } catch (error) {
      logger.error("getTeamPlayers error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
); */
