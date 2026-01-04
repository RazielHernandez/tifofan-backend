import {League} from "../types/league";

/**
 * Supported football leagues with metadata.
 * Keyed by league ID for fast lookup.
 */
export const SUPPORTED_LEAGUES: Record<number, League> = {
  39: {
    id: 39,
    name: "Premier League",
    country: "England",
    countryCode: "GB",
    fromSeason: 1992,
    logo: "https://media.api-sports.io/football/leagues/39.png",
  },
  140: {
    id: 140,
    name: "La Liga",
    country: "Spain",
    countryCode: "ES",
    fromSeason: 1929,
    logo: "https://media.api-sports.io/football/leagues/140.png",
  },
  135: {
    id: 135,
    name: "Serie A",
    country: "Italy",
    countryCode: "IT",
    fromSeason: 1898,
    logo: "https://media.api-sports.io/football/leagues/135.png",
  },
  78: {
    id: 78,
    name: "Bundesliga",
    country: "Germany",
    countryCode: "DE",
    fromSeason: 1963,
    logo: "https://media.api-sports.io/football/leagues/78.png",
  },
  61: {
    id: 61,
    name: "Ligue 1",
    country: "France",
    countryCode: "FR",
    fromSeason: 1932,
    logo: "https://media.api-sports.io/football/leagues/61.png",
  },
  262: {
    id: 262,
    name: "Liga MX",
    country: "Mexico",
    countryCode: "MX",
    fromSeason: 1943,
    logo: "https://media.api-sports.io/football/leagues/262.png",
  },
};
