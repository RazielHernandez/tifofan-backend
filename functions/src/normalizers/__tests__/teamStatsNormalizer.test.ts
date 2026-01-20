import {normalizeTeamStats} from "../teamStatsNormalizer";
import {TeamCore} from "../../types/team";

describe("normalizeTeamStats", () => {
  const team: TeamCore = {
    id: 33,
    name: "Manchester United",
  };

  it("returns defaults when fields are missing", () => {
    const raw = {
      form: null,
      fixtures: {},
      goals: {},
    };

    const result = normalizeTeamStats(raw, team, 39, 2024);

    expect(result.team.id).toBe(33);
    expect(result.form).toBeNull();
    expect(result.fixtures.played).toBe(0);
    expect(result.goals.for).toBe(0);
  });
});
