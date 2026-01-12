// /**
//  * Normalized team player.
//  */
// export interface NormalizedPlayer{
//   id:number;
//   name:string;
//   age:number;
//   nationality:string;
//   photo:string;
//   stats:NormalizedPlayerStats[];
// }

// export interface NormalizedPlayerStats{
//   teamId:number;
//   teamName:string;
//   teamLogo:string;

//   leagueId:number;
//   leagueName:string;
//   season:number;

//   appearances:number;
//   minutes:number;
//   position:string;
//   rating:number | null;

//   goals:number;
//   assists:number;

//   passes:number;
//   passAccuracy:number | null;

//   yellowCards:number;
//   redCards:number;
// }

import {TeamCore} from "./team";

export interface PlayerCore {
  id: number;
  name: string;
  photo?: string;
  age?: number;
  nationality?: string;
}

export interface PlayerSeasonStats {
  team: TeamCore;

  leagueId: number;
  leagueName: string;
  season: number;

  appearances: number;
  minutes: number;
  position: string;
  rating: number | null;

  goals: number;
  assists: number;

  passes: number;
  passAccuracy: number | null;

  yellowCards: number;
  redCards: number;
}

export interface PlayerMatchStats {
  minutes: number;
  position: string;
  rating: number | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface PlayerWithSeasonStats extends PlayerCore {
  stats: PlayerSeasonStats[];
}

export interface PlayerInMatch extends PlayerCore {
  team: TeamCore;
  stats: PlayerMatchStats;
}
