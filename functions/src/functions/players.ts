import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {defineSecret} from "firebase-functions/params";

import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
import {getQueryNumber} from "../utils/queryHelpers";

import {normalizeTeamPlayer} from "../normalizers/teamPlayersNormalizer";

const API_FOOTBALL_KEY = defineSecret("API_FOOTBALL_KEY");

/* -------------------------------------------------------------------------- */
/*                                   Players                                  */
/* -------------------------------------------------------------------------- */

/**
 * Returns player details by season.
 *
 * @example
 * GET /getPlayer?id=276&season=2024
 */
export const getPlayer = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  async (req, res): Promise<void> => {
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

      if (!Array.isArray(data) || !data[0]) {
        throw new Error("Player not found");
      }

      const player = normalizeTeamPlayer(data[0]);

      await setCached(cacheKey, player, 12 * 60 * 60);
      res.json(player);
    } catch (error) {
      logger.error("getPlayer error", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
);
