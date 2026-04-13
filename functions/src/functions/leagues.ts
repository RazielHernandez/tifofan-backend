import {onRequest, onCall, HttpsError} from "firebase-functions/v2/https";
import {SUPPORTED_LEAGUES} from "../constants/leagues";
import {buildResponse, ok} from "../utils/response";
import {defineSecret} from "firebase-functions/params";
import {buildCacheKey} from "../cache/cacheKeys";
import {safeFetch} from "../utils/safeFetch";
import {CACHE_TTL} from "../cache/cacheConfig";
import {fetchFromApiFootball} from "../api/apiFootball";
import {handler} from "../utils/handler";

const API_FOOTBALL_KEY = defineSecret("API_FOOTBALL_KEY");

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

export const getTeamsByLeague = onRequest(
  {secrets: [API_FOOTBALL_KEY]},
  handler(async (req, res) => {
    try {
      const league = Number(req.query.league);
      const season = Number(req.query.season);

      if (!league || !season) {
        res.status(400).json({
          error: "Missing params: league and season are required",
        });
        return;
      }

      const cacheKey = buildCacheKey("team", league, season);

      const {data, cached} = await safeFetch(
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

      ok(res, data, {cached});
    } catch (error: any) {
      console.error("getTeamsByLeagueHttp error:", error);

      res.status(500).json({
        error: "Internal server error",
      });
    }
  })
);

export const getTeamsByLeagueCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const league = Number(request.data.league);
    const season = Number(request.data.season);

    if (!league || !season) {
      throw new HttpsError("invalid-argument", "Missing params");
    }

    const cacheKey = buildCacheKey("team", league, season);

    const {data, cached} = await safeFetch(
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

    return buildResponse(data, {cached});
  }
);

export const getLeagueStandingsCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const league = Number(request.data.league);
    const season = Number(request.data.season);

    if (!league || !season) {
      throw new HttpsError("invalid-argument", "Missing params");
    }

    const cacheKey = buildCacheKey("standings", league, season);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.standings ?? 3600, // fallback 1 hour
      async () => {
        const raw: any = await fetchFromApiFootball(
          "standings",
          {league, season},
          API_FOOTBALL_KEY.value()
        );

        /**
         * API-Football structure:
         * raw.response[0].league.standings[0]
         */
        const table = raw.response?.[0]?.league?.standings?.[0] ?? [];

        return table.map((team: any) => ({
          rank: team.rank,

          team: {
            id: team.team.id,
            name: team.team.name,
            logo: team.team.logo,
          },

          points: team.points,
          goalsDiff: team.goalsDiff,
          group: team.group,

          form: team.form,

          all: {
            played: team.all.played,
            win: team.all.win,
            draw: team.all.draw,
            lose: team.all.lose,
            goalsFor: team.all.goals.for,
            goalsAgainst: team.all.goals.against,
          },

          home: {
            played: team.home.played,
            win: team.home.win,
            draw: team.home.draw,
            lose: team.home.lose,
          },

          away: {
            played: team.away.played,
            win: team.away.win,
            draw: team.away.draw,
            lose: team.away.lose,
          },
        }));
      }
    );

    return buildResponse(data, {cached});
  }
);

export const getLeagueStatsCallable = onCall(
  {secrets: [API_FOOTBALL_KEY]},
  async (request) => {
    const league = Number(request.data.league);
    const season = Number(request.data.season);

    if (!league || !season) {
      throw new HttpsError("invalid-argument", "Missing params");
    }

    const cacheKey = buildCacheKey("leagueStats", league, season);

    const {data, cached} = await safeFetch(
      cacheKey,
      CACHE_TTL.standings,
      async () => {
        const [
          scorers,
          assists,
          cards,
          standingsRaw,
        ] = await Promise.all([
          fetchFromApiFootball<any>(
            "players/topscorers", {league, season}, API_FOOTBALL_KEY.value()),
          fetchFromApiFootball<any>(
            "players/topassists", {league, season}, API_FOOTBALL_KEY.value()),
          fetchFromApiFootball<any>(
            "players/topcards", {league, season}, API_FOOTBALL_KEY.value()),
          fetchFromApiFootball<any>(
            "standings", {league, season}, API_FOOTBALL_KEY.value()),
        ]);

        const table = standingsRaw.response?.[0]?.league?.standings?.[0] ?? [];

        const bestAttack = table.reduce((a: any, b: any) =>
          a.all.goals.for > b.all.goals.for ? a : b
        );

        const bestDefense = table.reduce((a: any, b: any) =>
          a.all.goals.against < b.all.goals.against ? a : b
        );

        // 🔥 Normalize players
        const normalizePlayer = (p: any) => {
          const s = p.statistics?.[0];

          return {
            player: {
              id: p.player.id,
              name: p.player.name,
              photo: p.player.photo,
            },
            team: {
              id: s.team.id,
              name: s.team.name,
              logo: s.team.logo,
            },
            statistics: {
              goals: s.goals?.total ?? 0,
              assists: s.goals?.assists ?? 0,
              appearances: s.games?.appearences ?? 0,
              yellow: s.cards?.yellow ?? 0,
              red: s.cards?.red ?? 0,
            },
          };
        };

        return {
          topScorers: scorers.response.slice(0, 10).map(normalizePlayer),
          topAssists: assists.response.slice(0, 10).map(normalizePlayer),
          topCards: cards.response.slice(0, 10).map(normalizePlayer),

          teams: {
            bestAttack: {
              id: bestAttack.team.id,
              name: bestAttack.team.name,
              logo: bestAttack.team.logo,
              goals: bestAttack.all.goals.for,
            },
            bestDefense: {
              id: bestDefense.team.id,
              name: bestDefense.team.name,
              logo: bestDefense.team.logo,
              goalsAgainst: bestDefense.all.goals.against,
            },

            // 🔥 BONUS: top 5 teams by goals
            topScoringTeams: table
              .sort((a: any, b: any) => b.all.goals.for - a.all.goals.for)
              .slice(0, 5)
              .map((t: any) => ({
                id: t.team.id,
                name: t.team.name,
                logo: t.team.logo,
                goals: t.all.goals.for,
              })),
          },
        };
      }
    );

    return buildResponse(data, {cached});
  }
);
