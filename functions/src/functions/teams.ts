import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {defineSecret} from "firebase-functions/params";

import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
import {getQueryNumber} from "../utils/queryHelpers";
import {sanitizeForFirestore} from "../utils/sanitizeFirestore";

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
 * Returns team statistics by league and season.
 *
 * @example
 * GET /getTeamDetails?team=33&league=39&season=2024
 */
export const getTeamDetails = onRequest(
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

      const rawData = await fetchFromApiFootball(
        "teams/statistics",
        {team, league, season},
        API_FOOTBALL_KEY.value()
      );

      const data = sanitizeForFirestore(rawData);

      /* const data = await fetchFromApiFootball(
        "teams/statistics",
        {team, league, season},
        API_FOOTBALL_KEY.value()
      ); */

      await setCached(cacheKey, data, 24 * 60 * 60);
      res.json(data);
    } catch (error) {
      logger.error("getTeamDetails error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);

/**
 * Returns players of a team for a given season.
 *
 * @example
 * GET /getTeamPlayers?team=33&season=2024
 */
export const getTeamPlayers = onRequest(
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

      await setCached(cacheKey, data, 12 * 60 * 60);
      res.json(data);
    } catch (error) {
      logger.error("getTeamPlayers error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);
