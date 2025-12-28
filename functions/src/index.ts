import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";

import {fetchFromApiFootball} from "./api/apiFootball";
import {getCached, setCached} from "./cache/firestoreCache";

/**
 * API-Football secret key (stored securely with Firebase Secrets)
 */
const API_FOOTBALL_KEY = defineSecret("API_FOOTBALL_KEY");

/* -------------------------------------------------------------------------- */
/*                                Helpers                                     */
/* -------------------------------------------------------------------------- */

/**
 * Safely extracts a single query parameter as a string.
 *
 * @param {unknown} value - Query parameter value.
 * @return {string | undefined} Normalized string value.
 */
function getQueryParam(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

/**
 * Safely extracts a query parameter as a number.
 *
 * @param {unknown} value - Query parameter value.
 * @return {number | undefined} Parsed number or undefined.
 */
function getQueryNumber(value: unknown): number | undefined {
  const str = getQueryParam(value);
  if (!str) return undefined;
  const num = Number(str);
  return Number.isFinite(num) ? num : undefined;
}

/* -------------------------------------------------------------------------- */
/*                               Functions                                    */
/* -------------------------------------------------------------------------- */

/**
 * Health check / example function
 */
export const helloWorld = onRequest((req, res) => {
  res.json({status: "ok", service: "TifoFan backend"});
});

/**
 * Get fixtures (matches) by league and season
 *
 * @example
 * GET /getMatches?league=39&season=2024
 */
export const getMatches = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res) => {
    try {
      const league = getQueryNumber(req.query.league);
      const season = getQueryNumber(req.query.season);

      if (!league || !season) {
        res.status(400).json({error: "league and season are required"});
        return;
      }

      const cacheKey = `matches_${league}_${season}`;
      const cached = await getCached(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const data = await fetchFromApiFootball(
        "fixtures",
        {league, season},
        API_FOOTBALL_KEY.value()
      );

      await setCached(cacheKey, data, 60 * 60); // 1 hour
      res.json(data);
    } catch (error) {
      logger.error("getMatches error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);

/**
 * Get match details by fixture ID
 *
 * @example
 * GET /getMatchDetails?fixture=123456
 */
export const getMatchDetails = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res) => {
    try {
      const fixture = getQueryNumber(req.query.fixture);

      if (!fixture) {
        res.status(400).json({error: "fixture is required"});
        return;
      }

      const cacheKey = `match_${fixture}`;
      const cached = await getCached(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const data = await fetchFromApiFootball(
        "fixtures",
        {id: fixture},
        API_FOOTBALL_KEY.value()
      );

      await setCached(cacheKey, data, 30 * 60); // 30 minutes
      res.json(data);
    } catch (error) {
      logger.error("getMatchDetails error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);

/**
 * Get team details
 *
 * @example
 * GET /getTeam?id=33
 */
export const getTeam = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res) => {
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

      const data = await fetchFromApiFootball(
        "teams",
        {id: teamId},
        API_FOOTBALL_KEY.value()
      );

      await setCached(cacheKey, data, 24 * 60 * 60);
      res.json(data);
    } catch (error) {
      logger.error("getTeam error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);

/**
 * Get team details by ID
 *
 * @example GET /getTeamDetails?id=33
 */
export const getTeamDetails = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res) => {
    try {
      const teamId = getQueryNumber(req.query.id);
      if (!teamId) {
        res.status(400).json({error: "team id is required"});
        return;
      }

      const cacheKey = `teamDetails_${teamId}`;
      const cached = await getCached(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const data = await fetchFromApiFootball(
        "teams/statistics",
        {team: teamId},
        API_FOOTBALL_KEY.value()
      );

      await setCached(cacheKey, data, 24 * 60 * 60);
      res.json(data);
    } catch (error) {
      logger.error("getTeamDetails error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);

/**
 * Get player details
 *
 * @example
 * GET /getPlayer?id=276&season=2024
 */
export const getPlayer = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res) => {
    try {
      const playerId = getQueryNumber(req.query.id);
      const season = getQueryNumber(req.query.season);

      if (!playerId || !season) {
        res.status(400).json({error: "player id and season are required"});
        return;
      }

      const cacheKey = `player_${playerId}_${season}`;
      const cached = await getCached(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const data = await fetchFromApiFootball(
        "players",
        {id: playerId, season},
        API_FOOTBALL_KEY.value()
      );

      await setCached(cacheKey, data, 12 * 60 * 60);
      res.json(data);
    } catch (error) {
      logger.error("getPlayer error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);
