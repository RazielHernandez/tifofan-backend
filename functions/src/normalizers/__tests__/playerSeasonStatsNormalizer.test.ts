import {normalizePlayerSeasonStats} from "../playerSeasonStatsNormalizer";
import {PlayerSeasonStats} from "../../types/player";

describe("normalizePlayerSeasonStats", () => {
  it("normalizes a complete player season stat correctly", () => {
    const raw = {
      team: {
        id: 33,
        name: "Manchester United",
        logo: "logo.png",
      },
      league: {
        id: 39,
        name: "Premier League",
        season: 2024,
      },
      games: {
        appearances: 10,
        minutes: 900,
        position: "Midfielder",
        rating: "7.2",
      },
      goals: {
        total: 3,
        assists: 2,
      },
      passes: {
        total: 500,
        accuracy: "84",
      },
      cards: {
        yellow: 2,
        red: 0,
      },
    };

    const result: PlayerSeasonStats = normalizePlayerSeasonStats(raw);

    expect(result).toEqual({
      team: {
        id: 33,
        name: "Manchester United",
        logo: "logo.png",
        country: null,
      },

      leagueId: 39,
      leagueName: "Premier League",
      season: 2024,

      appearances: 10,
      minutes: 900,
      position: "Midfielder",
      rating: 7.2,

      goals: 3,
      assists: 2,

      passes: 500,
      passAccuracy: 84,

      yellowCards: 2,
      redCards: 0,
    });
  });

  it("handles missing and null values safely", () => {
    const raw = {
      team: {
        id: 33,
        name: "Manchester United",
        logo: "",
        country: null,
      },
      league: {
        id: 39,
        name: "Premier League",
        season: 2024,
      },
      games: {},
      goals: {},
      passes: {},
      cards: {},
    };

    const result = normalizePlayerSeasonStats(raw);

    expect(result).toEqual({
      team: {
        id: 33,
        name: "Manchester United",
        logo: "",
        country: null,
      },

      leagueId: 39,
      leagueName: "Premier League",
      season: 2024,

      appearances: 0,
      minutes: 0,
      position: "",
      rating: null,

      goals: 0,
      assists: 0,

      passes: 0,
      passAccuracy: null,

      yellowCards: 0,
      redCards: 0,
    });
  });
});
