export {
  getMatches,
  getMatchDetails,
  getMatchStatistics,
  getMatchLineups,
  getMatchesCallable,
  getMatchDetailsCallable,
  getMatchStatisticsCallable,
  getMatchLineupsCallable,
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
} from "../functions/leagues";

export {
  saveFavorites,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../functions/preferences";
