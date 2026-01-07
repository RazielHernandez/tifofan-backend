export interface NormalizedMatch {
  id: number;
  leagueId: number;
  season: number;
  date: string;
  status: string;
  homeTeam: {
    id: number;
    name: string;
    logo: string;
    goals: number | null;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
    goals: number | null;
  };
}

export interface NormalizedMatchDetails extends NormalizedMatch {
  venue?: string;
  referee?: string;
  halftimeScore?: string;
  fulltimeScore?: string;
}


export interface MatchTeamStatistics {
  teamId:number;
  teamName:string;
  logo:string;
  stats:Record<string, number | string | null>;
}
