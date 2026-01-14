export interface TeamSeasonAggregates {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;

  winRate: number;
  points: number;

  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;

  goalsForPerMatch: number;
  goalsAgainstPerMatch: number;
}
