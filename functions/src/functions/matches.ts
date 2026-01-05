import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";

import {fetchFromApiFootball} from "../api/apiFootball";
import {getCached, setCached} from "../cache/firestoreCache";
import {handler} from "../utils/handler";
import {getNumberParam} from "../utils/queryHelpers";
import {
  normalizeMatch,
  normalizeMatchDetails,
} from "../normalizers/matchNormalize";

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

    const cacheKey = `matches_${league}_${season}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const raw = await fetchFromApiFootball(
      "fixtures",
      {league, season},
      API_FOOTBALL_KEY.value()
    );

    const matches = raw.map(normalizeMatch);
    await setCached(cacheKey, matches, 12 * 60 * 60);
    res.json(matches);
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

    const cacheKey = `match_${matchId}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const raw = await fetchFromApiFootball(
      "fixtures",
      {id: matchId},
      API_FOOTBALL_KEY.value()
    );

    const match = normalizeMatchDetails(raw[0]);
    await setCached(cacheKey, match, 10 * 60);
    res.json(match);
  })
);
