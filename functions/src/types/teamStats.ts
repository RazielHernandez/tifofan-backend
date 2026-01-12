// /**
//  * Normalized team statistics for a season and league.
//  */
// export interface TeamStats {
//   teamId: number;
//   leagueId: number;
//   season: number;
//   form: string | null;
//   fixtures: {
//     played: number;
//     wins: number;
//     draws: number;
//     losses: number;
//   };
//   goals: {
//     for: number;
//     against: number;
//   };
// }

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
