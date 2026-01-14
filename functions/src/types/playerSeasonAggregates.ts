export interface PlayerSeasonAggregates {
  appearances: number;
  minutes: number;

  goals: number;
  assists: number;

  yellowCards: number;
  redCards: number;

  averageRating: number | null;
  goalsPer90: number;
  assistsPer90: number;
}
