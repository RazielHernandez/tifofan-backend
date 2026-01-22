import {TeamCore} from "./team";
import {PlayerInMatch} from "./player";

export interface MatchCore {
  id: number;
  leagueId: number;
  season: number;
  date: string;
  status: string;
}

export interface MatchTeam {
  team: TeamCore;
  goals: number | null;
}

export interface NormalizedMatch extends MatchCore {
  home: MatchTeam;
  away: MatchTeam;
}

export interface NormalizedMatchDetails extends NormalizedMatch {
  venue?: string;
  referee?: string;
  halftimeScore?: string;
  fulltimeScore?: string;
  players?: {
    home: PlayerInMatch[];
    away: PlayerInMatch[];
  };
}

export interface MatchTeamStatistics {
  team: TeamCore;

  stats: {
    shotsOnGoal?: number | null;
    shotsOffGoal?: number | null;
    totalShots?: number | null;

    possession?: number | null;

    passes?: number | null;
    passAccuracy?: number | null;

    fouls?: number | null;
    yellowCards?: number | null;
    redCards?: number | null;

    corners?: number | null;
    offsides?: number | null;

    expectedGoals?: number | null;

    [key: string]: number | null | undefined;
  };
}
