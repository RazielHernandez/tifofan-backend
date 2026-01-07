import {onRequest} from "firebase-functions/v2/https";
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
import {ok} from "../utils/response";

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
  handler(async (req, res)=>{
    const league = getNumberParam(req.query.league, "league");
    const season = getNumberParam(req.query.season, "season");
    const page = getNumberParam(req.query.page, "page") ?? 1;

    const PER_PAGE = 20;

    const cacheKey = buildCacheKey("matches", league, season);

    // 1️⃣ Try cache (full dataset)
    const cached = await getCached<any[]>(cacheKey);
    let matches: any[];

    if (cached) {
      matches = cached;
    } else {
      // 2️⃣ Fetch once
      const raw: any = await fetchFromApiFootball(
        "fixtures",
        {league, season},
        API_FOOTBALL_KEY.value()
      );

      matches = raw.response.map(normalizeMatch);

      // 3️⃣ Cache normalized data
      await setCached(cacheKey, matches, CACHE_TTL.matches);
    }

    // 4️⃣ Paginate in backend
    const start = (page - 1) * PER_PAGE;
    const paged = matches.slice(start, start + PER_PAGE);

    const pagination = {
      page,
      perPage: PER_PAGE,
      totalItems: matches.length,
      totalPages: Math.ceil(matches.length / PER_PAGE),
      hasNext: page * PER_PAGE < matches.length,
    };

    ok(res, paged, {
      cached: Boolean(cached),
      pagination,
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
  })
);


/**
 * Returns match statistics by fixture ID.
 *
 * @example
 * GET /getMatchStatistics?fixture=215662
 */
export const getMatchStatistics = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  handler(async (req, res)=>{
    const fixture = getNumberParam(req.query.fixture, "fixture");

    const cacheKey = buildCacheKey(
      "matchStats",
      fixture
    );

    const cached = await getCached<any[]>(cacheKey);
    if (cached) {
      ok(res, cached, {cached: true});
      return;
    }

    const raw:any = await fetchFromApiFootball(
      "fixtures/statistics",
      {fixture},
      API_FOOTBALL_KEY.value()
    );

    if (!Array.isArray(raw.response) || raw.response.length === 0) {
      throw new Error("Empty match statistics response");
    }

    const normalized = raw.response.map(normalizeMatchStatistics);

    await setCached(
      cacheKey,
      normalized,
      CACHE_TTL.matchDetails
    );

    ok(res, normalized, {cached: false});
  })
);
