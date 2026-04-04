import {onRequest, onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";

import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
import {buildCacheKey} from "../cache/cacheKeys";
import {CACHE_TTL} from "../cache/cacheConfig";
import {handler} from "../utils/handler";
import {getNumberParam} from "../utils/queryHelpers";
import {
  normalizeMatch,
  normalizeMatchDetails,
} from "../normalizers/matchNormalize";
import {
  normalizeMatchStatistics,
} from "../normalizers/matchStatisticsNormalizer";
import {buildResponse, ok} from "../utils/response";
import {safeFetch} from "../utils/safeFetch";

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
  handler(async (req, res) => {
    const league = getNumberParam(req.query.league, "league");
    const season = getNumberParam(req.query.season, "season");
    const page = getNumberParam(req.query.page, "page") ?? 1;

    const PER_PAGE = 20;

    const cacheKey = buildCacheKey("matches", league, season);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.matches,
      async () => {
        // 🔥 OPTIONAL improvement: restrict date range
        const raw: any = await fetchFromApiFootball(
          "fixtures",
          {league, season},
          API_FOOTBALL_KEY.value()
        );

        return raw.response.map(normalizeMatch);
      }
    );

    const start = (page - 1) * PER_PAGE;
    const paged = data.slice(start, start + PER_PAGE);

    ok(res, paged, {
      cached,
      pagination: {
        page,
        perPage: PER_PAGE,
        totalItems: data.length,
        totalPages: Math.ceil(data.length / PER_PAGE),
        // hasNext: page * PER_PAGE < data.length,
      },
    });
  })
);

/**
 * Returns match details by fixture ID.
 *
 * @example
 * GET /getMatchDetails?fixture=123456
 */
export const getMatchDetails = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  handler(async (req, res) => {
    const matchId = getNumberParam(req.query.fixture, "matchId");

    const cacheKey = buildCacheKey("matchDetails", matchId);
    const cached = await getCached(cacheKey);
    if (cached) {
      ok(res, cached, {cached: true});
      return;
    }

    const raw: any = await fetchFromApiFootball(
      "fixtures",
      {id: matchId},
      API_FOOTBALL_KEY.value()
    );

    if (!raw.response?.length) {
      throw new Error("Empty match response");
    }

    const match = normalizeMatchDetails(raw.response[0]);
    await setCached(cacheKey, match, CACHE_TTL.matchDetails);
    ok(res, match, {cached: false});
  }, "getMatchDetails")
);


/**
 * Returns match statistics by fixture ID.
 *
 * @example
 * GET /getMatchStatistics?fixture=215662
 */
export const getMatchStatistics = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  handler(async (req, res) => {
    const fixture = getNumberParam(req.query.fixture, "fixture");
    const cacheKey = buildCacheKey("matchStats", fixture);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.matchStats,
      async () => {
        const raw: any = await fetchFromApiFootball(
          "fixtures/statistics",
          {fixture},
          API_FOOTBALL_KEY.value()
        );

        return raw.response.map(normalizeMatchStatistics);
      }
    );

    ok(res, data, {cached});
  })
);

/* -------------------------------------------------------------------------- */
/*                                Callables                                   */
/* -------------------------------------------------------------------------- */

export const getMatchesCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const league = Number(request.data.league);
    const season = Number(request.data.season);
    const page = Number(request.data.page ?? 1);

    if (!league || !season) {
      throw new HttpsError(
        "invalid-argument",
        "league and season are required"
      );
    }

    const PER_PAGE = 20;
    const cacheKey = buildCacheKey("matches", league, season);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.matches,
      async () => {
        const raw: any = await fetchFromApiFootball(
          "fixtures",
          {league, season},
          API_FOOTBALL_KEY.value()
        );

        return raw.response.map(normalizeMatch);
      }
    );

    const start = (page - 1) * PER_PAGE;
    const paged = data.slice(start, start + PER_PAGE);

    return buildResponse(paged, {
      cached,
      pagination: {
        page,
        perPage: PER_PAGE,
        totalItems: data.length,
        totalPages: Math.ceil(data.length / PER_PAGE),
        hasNext: page * PER_PAGE < data.length,
      },
    });
  }
);

export const getMatchDetailsCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const matchId = Number(request.data.fixture);

    if (!matchId) {
      throw new HttpsError(
        "invalid-argument",
        "fixture is required"
      );
    }

    const cacheKey = buildCacheKey("matchDetails", matchId);
    const cached = await getCached(cacheKey);

    if (cached) {
      // return {item: cached, cached: true};
      return buildResponse(cached, {cached: true});
    }

    const raw: any = await fetchFromApiFootball(
      "fixtures",
      {id: matchId},
      API_FOOTBALL_KEY.value()
    );

    if (!raw.response?.length) {
      throw new HttpsError(
        "not-found",
        "Match not found"
      );
    }

    const match = normalizeMatchDetails(raw.response[0]);

    await setCached(cacheKey, match, CACHE_TTL.matchDetails);

    // return {item: match, cached: false};
    return buildResponse(match, {cached: false});
  }
);

export const getMatchStatisticsCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const fixture = Number(request.data.fixture);

    if (!fixture) {
      throw new HttpsError(
        "invalid-argument",
        "fixture is required"
      );
    }

    const cacheKey = buildCacheKey("matchStats", fixture);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.matchStats,
      async () => {
        const raw: any = await fetchFromApiFootball(
          "fixtures/statistics",
          {fixture},
          API_FOOTBALL_KEY.value()
        );

        if (!Array.isArray(raw.response) || raw.response.length === 0) {
          throw new HttpsError(
            "not-found",
            "Match statistics not found"
          );
        }

        return raw.response.map(normalizeMatchStatistics);
      }
    );

    return buildResponse(data, {cached});
  }
);
