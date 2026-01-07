/**
 * Cache versions per resource.
 * Increment ONLY when response shape changes.
 */
export const CACHE_VERSION = {
  team: 1,
  teamDetails: 1,
  teamPlayers: 1,
  player: 1,
  matches: 1,
  matchDetails: 1,
  matchStats: 1,
} as const;

/**
 * Cache TTLs (seconds) by resource type.
 * team: 24 * 60 * 60,           // 24h – rarely changes
 * teamDetails: 12 * 60 * 60,    // 12h – stats change daily
 * teamPlayers: 6 * 60 * 60,     // 6h – lineups transfer more often
 * player: 12 * 60 * 60,         // 12h – bio mostly static
 * matches: 2 * 60,              // 2 min – live data
 * matchDetails: 1 * 60,         // 1 min – very dynamic
 */
export const CACHE_TTL = {
  team: 24 * 60 * 60,
  teamDetails: 12 * 60 * 60,
  teamPlayers: 6 * 60 * 60,
  player: 12 * 60 * 60,
  matches: 2 * 60,
  matchDetails: 1 * 60,
  matchStats: 1 * 60,
} as const;
