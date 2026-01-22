import {TeamCore} from "./team";

export interface TeamStats {
  team: TeamCore;
  leagueId: number;
  season: number;

  form: string | null;

  fixtures: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
  };

  goals: {
    for: number;
    against: number;
  };
}
