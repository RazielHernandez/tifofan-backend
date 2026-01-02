/**
 * Normalized team player.
 */
export interface NormalizedPlayer{
  id:number;
  name:string;
  age:number;
  nationality:string;
  photo:string;
  stats:NormalizedPlayerStats[];
}

export interface NormalizedPlayerStats{
  teamId:number;
  teamName:string;
  teamLogo:string;

  leagueId:number;
  leagueName:string;
  season:number;

  appearances:number;
  minutes:number;
  position:string;
  rating:number | null;

  goals:number;
  assists:number;

  passes:number;
  passAccuracy:number | null;

  yellowCards:number;
  redCards:number;
}
