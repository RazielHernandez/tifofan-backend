import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
import {buildCacheKey} from "../cache/cacheKeys";
import {CACHE_TTL} from "../cache/cacheConfig";
import {normalizeTeamPlayer} from "../normalizers/teamPlayersNormalizer";
import {handler} from "../utils/handler";
import {getNumberParam} from "../utils/queryHelpers";
import {ok} from "../utils/response";
import {
  aggregatePlayerSeasonStats} from "../aggregators/playerSeasonAggregates";

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
    const cacheKey = buildCacheKey("player", playerId, season);
    const cached = await getCached(cacheKey);
    if (cached) {
      ok(res, cached, {cached: true});
      return;
    }

    const raw: any = await fetchFromApiFootball(
      "players",
      {id: playerId, season},
      API_FOOTBALL_KEY.value()
    );

    if (!raw.response?.length) {
      throw new Error("Empty player response");
    }

    // Normalize (PlayerWithSeasonStats)
    const normalizedPlayer = normalizeTeamPlayer(raw.response[0]);

    // Aggregate season stats
    const aggregates = aggregatePlayerSeasonStats(
      normalizedPlayer.stats
    );

    const response = {
      player: {
        id: normalizedPlayer.id,
        name: normalizedPlayer.name,
        photo: normalizedPlayer.photo,
        age: normalizedPlayer.age,
        nationality: normalizedPlayer.nationality,
      },
      season,
      stats: normalizedPlayer.stats,
      aggregates,
    };

    await setCached(cacheKey, response, CACHE_TTL.player);

    ok(res, response, {cached: false});
  }, "getPlayer")
);
