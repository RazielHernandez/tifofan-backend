import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {defineSecret} from "firebase-functions/params";

import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
import {getQueryNumber} from "../utils/queryHelpers";

const API_FOOTBALL_KEY = defineSecret("API_FOOTBALL_KEY");

/* -------------------------------------------------------------------------- */
/*                                  Matches                                   */
/* -------------------------------------------------------------------------- */

/**
 * Returns fixtures by league and season.
 *
 * @param req HTTP request
 * @param res HTTP response
 *
 * @example
 * GET /getMatches?league=39&season=2024
 */
export const getMatches = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res): Promise<void> => {
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

      await setCached(cacheKey, data, 60 * 60);
      res.json(data);
    } catch (error) {
      logger.error("getMatches error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);

/**
 * Returns match details by fixture ID.
 *
 * @example
 * GET /getMatchDetails?fixture=123456
 */
export const getMatchDetails = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res): Promise<void> => {
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

      await setCached(cacheKey, data, 30 * 60);
      res.json(data);
    } catch (error) {
      logger.error("getMatchDetails error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);
