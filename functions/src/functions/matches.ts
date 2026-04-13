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

export const getMatchLineups = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  handler(async (req, res) => {
    try {
      const fixture = Number(req.query.fixture);

      if (!fixture) {
        res.status(400).json({
          error: "Missing param: fixture is required",
        });
        return;
      }

      const cacheKey = buildCacheKey("lineups", fixture);

      const {data, cached} = await safeFetch(
        cacheKey,
        CACHE_TTL.lineups ?? 3600,
        async () => {
          const raw: any = await fetchFromApiFootball(
            "fixtures/lineups",
            {fixture},
            API_FOOTBALL_KEY.value()
          );

          return (raw.response ?? []).map((teamBlock: any) => ({
            team: {
              id: teamBlock.team.id,
              name: teamBlock.team.name,
              logo: teamBlock.team.logo,

              colors: {
                player: {
                  primary: teamBlock.team.colors?.player?.primary,
                  number: teamBlock.team.colors?.player?.number,
                  border: teamBlock.team.colors?.player?.border,
                },
                goalkeeper: {
                  primary: teamBlock.team.colors?.goalkeeper?.primary,
                  number: teamBlock.team.colors?.goalkeeper?.number,
                  border: teamBlock.team.colors?.goalkeeper?.border,
                },
              },
            },

            coach: {
              id: teamBlock.coach?.id,
              name: teamBlock.coach?.name,
              photo: teamBlock.coach?.photo,
            },

            formation: teamBlock.formation,

            startXI: (teamBlock.startXI ?? []).map((p: any) => ({
              id: p.player.id,
              name: p.player.name,
              number: p.player.number,
              position: p.player.pos,
              grid: p.player.grid,
            })),

            substitutes: (teamBlock.substitutes ?? []).map((p: any) => ({
              id: p.player.id,
              name: p.player.name,
              number: p.player.number,
              position: p.player.pos,
              grid: p.player.grid,
            })),
          }));
        }
      );

      ok(res, data, {cached});
    } catch (error) {
      console.error("getMatchLineups error:", error);

      res.status(500).json({
        error: "Internal server error",
      });
    }
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

export const getMatchLineupsCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const fixture = Number(request.data.fixture);

    if (!fixture) {
      throw new HttpsError("invalid-argument", "Missing params");
    }

    const cacheKey = buildCacheKey("lineups", fixture);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.lineups ?? 3600,
      async () => {
        const raw: any = await fetchFromApiFootball(
          "fixtures/lineups",
          {fixture},
          API_FOOTBALL_KEY.value()
        );

        return (raw.response ?? []).map((teamBlock: any) => ({
          // ✅ TEAM
          team: {
            id: teamBlock.team.id,
            name: teamBlock.team.name,
            logo: teamBlock.team.logo,

            colors: {
              player: {
                primary: teamBlock.team.colors?.player?.primary,
                number: teamBlock.team.colors?.player?.number,
                border: teamBlock.team.colors?.player?.border,
              },
              goalkeeper: {
                primary: teamBlock.team.colors?.goalkeeper?.primary,
                number: teamBlock.team.colors?.goalkeeper?.number,
                border: teamBlock.team.colors?.goalkeeper?.border,
              },
            },
          },

          // ✅ COACH
          coach: {
            id: teamBlock.coach?.id,
            name: teamBlock.coach?.name,
            photo: teamBlock.coach?.photo,
          },

          // ✅ FORMATION
          formation: teamBlock.formation,

          // ✅ STARTING XI
          startXI: (teamBlock.startXI ?? []).map((p: any) => ({
            id: p.player.id,
            name: p.player.name,
            number: p.player.number,
            position: p.player.pos,
            grid: p.player.grid, // 🔥 key for UI positioning
          })),

          // ✅ SUBSTITUTES
          substitutes: (teamBlock.substitutes ?? []).map((p: any) => ({
            id: p.player.id,
            name: p.player.name,
            number: p.player.number,
            position: p.player.pos,
            grid: p.player.grid, // usually null
          })),
        }));
      }
    );

    return buildResponse(data, {cached});
  }
);

export const getMatchesByTeamCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const team = Number(request.data.team);
    const season = Number(request.data.season);

    if (!team || !season) {
      throw new HttpsError("invalid-argument", "Missing params");
    }

    const cacheKey = buildCacheKey("matches", team, season);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.matches,
      async () => {
        const raw: any = await fetchFromApiFootball(
          "fixtures",
          {team, season},
          API_FOOTBALL_KEY.value()
        );

        return raw.response.map(normalizeMatch);
      }
    );

    return buildResponse(data, {cached});
  }
);

export const getMatchesByDateCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const date = request.data.date; // "YYYY-MM-DD"

    if (!date) {
      throw new HttpsError("invalid-argument", "Missing date");
    }

    const cacheKey = buildCacheKey("matches", date);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.matches,
      async () => {
        const raw: any = await fetchFromApiFootball(
          "fixtures",
          {date},
          API_FOOTBALL_KEY.value()
        );

        return raw.response.map(normalizeMatch);
      }
    );

    return buildResponse(data, {cached});
  }
);

export const getMatchesByRoundCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const league = Number(request.data.league);
    const season = Number(request.data.season);
    const round = request.data.round;

    if (!league || !season || !round) {
      throw new HttpsError("invalid-argument", "Missing params");
    }

    const cacheKey = buildCacheKey("matches", league, season, round);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.matches,
      async () => {
        const raw: any = await fetchFromApiFootball(
          "fixtures",
          {league, season, round},
          API_FOOTBALL_KEY.value()
        );

        return raw.response.map(normalizeMatch);
      }
    );

    return buildResponse(data, {cached});
  }
);
