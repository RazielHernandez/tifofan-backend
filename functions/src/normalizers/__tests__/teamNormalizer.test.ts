import {normalizeTeam} from "../teamNormalizer";

describe("normalizeTeam", () => {
  it("should normalize team data", () => {
    const raw = {
      team: {
        id: 33,
        name: "Barcelona",
        country: "Spain",
        founded: 1899,
        logo: "barca.png",
        national: false,
      },
      venue: {
        id: 1,
        name: "Camp Nou",
        city: "Barcelona",
        capacity: 99354,
        image: "campnou.png",
      },
    };

    const result = normalizeTeam(raw);

    expect(result.id).toBe(33);
    expect(result.name).toBe("Barcelona");
    expect(result.venue?.name).toBe("Camp Nou");
  });

  it("should throw if required fields are missing", () => {
    expect(() => normalizeTeam({})).toThrow("Invalid team response");
  });
});
