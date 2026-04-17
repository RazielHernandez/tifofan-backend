export {
  getMatches,
  getMatchDetails,
  getMatchStatistics,
  getMatchLineups,
  getMatchesCallable,
  getMatchDetailsCallable,
  getMatchStatisticsCallable,
  getMatchLineupsCallable,
  getMatchesByDateCallable,
  getMatchesByRoundCallable,
  getMatchesByTeamCallable,
  getMatchEventsCallable,
} from "../functions/matches";

export {
  getTeam,
  getTeamDetails,
  getTeamPlayers,
  getTeamCallable,
  getTeamDetailsCallable,
  getTeamPlayersCallable,
} from "../functions/teams";

export {
  getPlayer,
  getPlayerCallable,
} from "../functions/players";

export {
  getSupportedLeagues,
  getSupportedLeaguesCallable,
  getTeamsByLeague,
  getTeamsByLeagueCallable,
  getLeagueStandingsCallable,
  getLeagueStatsCallable,
} from "../functions/leagues";

export {
  saveFavorites,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../functions/preferences";
