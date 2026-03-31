import {onRequest, onCall, HttpsError} from "firebase-functions/v2/https";
import {SUPPORTED_LEAGUES} from "../constants/leagues";
import {buildResponse} from "../utils/response";
import {defineSecret} from "firebase-functions/params";
import {buildCacheKey} from "../cache/cacheKeys";
import {safeFetch} from "../utils/safeFetch";
import {CACHE_TTL} from "../cache/cacheConfig";
import {fetchFromApiFootball} from "../api/apiFootball";

const API_FOOTBALL_KEY = defineSecret("API_FOOTBALL_KEY");
// import {ApiError} from "../utils/apiError";

/**
 * Returns all supported leagues with metadata.
 *
 * @example
 * GET /getSupportedLeagues
 */
export const getSupportedLeagues = onRequest((_req, res): void => {
  res.json(Object.values(SUPPORTED_LEAGUES));
});

/**
 * Returns all supported leagues with metadata.
 *
 * @example
 * GET /getSupportedLeagues
 */
export const getSupportedLeaguesCallable = onCall((request) => {
  /* if (!request.auth) {
    // throw new HttpsError("unauthenticated", "Login required");
    throw new ApiError(request.auth ? 403 : 401,
      "unauthenticated",
      "Login required");
  } */
  // return Object.values(SUPPORTED_LEAGUES);
  return buildResponse(Object.values(SUPPORTED_LEAGUES));
});

export const getTeamsByLeague = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const league = Number(request.data.league);
    const season = Number(request.data.season);

    if (!league || !season) {
      throw new HttpsError("invalid-argument", "Missing params");
    }

    const cacheKey = buildCacheKey("team", league, season);

    const {data} = await safeFetch(
      cacheKey,
      CACHE_TTL.team,
      async () => {
        const raw: any = await fetchFromApiFootball(
          "teams",
          {league, season},
          API_FOOTBALL_KEY.value()
        );

        return raw.response.map((t: any) => ({
          id: t.team.id,
          name: t.team.name,
          logo: t.team.logo,
        }));
      }
    );

    return data;
  }
);
