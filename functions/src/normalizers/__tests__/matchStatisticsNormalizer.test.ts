import {normalizeMatchStatistics} from "../matchStatisticsNormalizer";

describe("normalizeMatchStatistics", () => {
  it("should normalize valid match statistics", () => {
    const raw = {
      team: {
        id: 33,
        name: "Barcelona",
        logo: "barca.png",
      },
      statistics: [
        {type: "Shots on Goal", value: 5},
        {type: "Shots off Goal", value: 7},
        {type: "Possession", value: "60%"},
        {type: "Yellow Cards", value: 2},
      ],
    };

    const result = normalizeMatchStatistics(raw);

    // expect(result).toEqual({
    //   team: {
    //     id: 33,
    //     name: "Barcelona",
    //     logo: "barca.png",
    //   },
    //   stats: {
    //     "Shots on Goal": 5,
    //     "Shots off Goal": 7,
    //     "Possession": "60%",
    //     "Yellow Cards": 2,
    //   },
    // });

    expect(result).toEqual({
      team: {
        id: 33,
        name: "Barcelona",
        logo: "barca.png",
      },
      stats: {
        shotsOnGoal: 5,
        shotsOffGoal: 7,
        yellowCards: 2,
      },
    });
  });

  it("should throw on invalid input", () => {
    expect(() => normalizeMatchStatistics({})).toThrow(
      "Invalid match statistics response"
    );
  });
});
