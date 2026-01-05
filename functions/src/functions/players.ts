import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
import {normalizeTeamPlayer} from "../normalizers/teamPlayersNormalizer";
import {handler} from "../utils/handler";
import {getNumberParam} from "../utils/queryHelpers";

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
  handler(async (req, res) => {
    const playerId = getNumberParam(req.query.id, "id");
    const season = getNumberParam(req.query.season, "season");

    const cacheKey = `player_${playerId}_${season}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const raw = await fetchFromApiFootball(
      "players",
      {id: playerId, season},
      API_FOOTBALL_KEY.value()
    );

    const player = normalizeTeamPlayer(raw[0]);
    await setCached(cacheKey, player, 12 * 60 * 60);
    res.json(player);
  })
);
