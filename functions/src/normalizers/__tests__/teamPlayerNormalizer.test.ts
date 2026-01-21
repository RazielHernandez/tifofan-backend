import {normalizeTeamPlayer} from "../teamPlayersNormalizer";

describe("normalizeTeamPlayer", () => {
  it("should normalize a team player with stats", () => {
    const raw = {
      player: {
        id: 10,
        name: "Messi",
        age: 36,
        nationality: "Argentina",
        photo: "messi.png",
      },
      statistics: [
        {
          team: {id: 33, name: "Barcelona", logo: "barca.png"},
          league: {id: 39, name: "La Liga", season: 2024},
          games: {appearences: 30, minutes: 2500, position: "Forward"},
          goals: {total: 20, assists: 10},
          passes: {total: 800, accuracy: "90"},
          cards: {yellow: 2, red: 0},
        },
      ],
    };

    const result = normalizeTeamPlayer(raw);

    expect(result.id).toBe(10);
    expect(result.stats.length).toBe(1);
    expect(result.stats[0].goals).toBe(20);
  });

  it("should throw if player data is missing", () => {
    expect(() => normalizeTeamPlayer({})).toThrow("Invalid player response");
  });
});
