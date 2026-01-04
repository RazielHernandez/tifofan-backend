/**
 * Metadata for a supported football league.
 */
export interface League {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  fromSeason: number;
  logo?: string;
}
