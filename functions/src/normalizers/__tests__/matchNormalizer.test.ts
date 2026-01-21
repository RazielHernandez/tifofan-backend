import {normalizeMatch} from "../matchNormalize";
import {NormalizedMatch} from "../../types/match";

describe("matchNormalize", () => {
  it("should normalize a valid fixture into NormalizedMatch", () => {
    const rawFixture = {
      fixture: {
        id: 123,
        date: "2024-08-10T18:00:00Z",
        status: {short: "FT"},
        venue: {name: "Old Trafford"},
      },
      league: {
        id: 39,
        season: 2024,
      },
      teams: {
        home: {
          id: 33,
          name: "Manchester United",
          logo: "home.png",
        },
        away: {
          id: 34,
          name: "Newcastle",
          logo: "away.png",
        },
      },
      goals: {
        home: 2,
        away: 1,
      },
    };

    const result: NormalizedMatch = normalizeMatch(rawFixture);

    expect(result).toEqual({
      id: 123,
      leagueId: 39,
      season: 2024,
      date: "2024-08-10T18:00:00Z",
      status: "FT",
      home: {
        team: {
          id: 33,
          name: "Manchester United",
          logo: "home.png",
        },
        goals: 2,
      },
      away: {
        team: {
          id: 34,
          name: "Newcastle",
          logo: "away.png",
        },
        goals: 1,
      },
    });
  });

  it("should allow null goals for upcoming matches", () => {
    const rawFixture = {
      fixture: {
        id: 999,
        date: "2024-09-01T18:00:00Z",
        status: {short: "NS"},
      },
      league: {
        id: 39,
        season: 2024,
      },
      teams: {
        home: {
          id: 1,
          name: "Team A",
          logo: "a.png",
        },
        away: {
          id: 2,
          name: "Team B",
          logo: "b.png",
        },
      },
      goals: {
        home: null,
        away: null,
      },
    };

    const result = normalizeMatch(rawFixture);

    expect(result.home.goals).toBeNull();
    expect(result.away.goals).toBeNull();
  });

  it("should throw an error if fixture structure is invalid", () => {
    const invalidFixture = {
      league: {id: 39},
    };

    expect(() => normalizeMatch(invalidFixture)).toThrow(
      "Invalid match response"
    );
  });
});
