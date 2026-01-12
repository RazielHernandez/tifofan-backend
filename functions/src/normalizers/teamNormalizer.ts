import {TeamCore, Team} from "../types/team";

/**
 * Normalizes a minimal team object (core fields).
 *
 * @param {Partial<TeamCore>} team Raw team core object.
 * @return {TeamCore} Normalized team core.
 */
export function normalizeTeamCore(team: Partial<TeamCore>): TeamCore {
  if (!team?.id || !team?.name) {
    throw new Error("Invalid team core response");
  }

  return {
    id: team.id,
    name: team.name,
    logo: team.logo ?? null,
    country: team.country ?? null,
  };
}

/**
 * Normalizes a team response from API-Football.
 * @param {any} item Raw API-Football team item.
 * @return {Team} Normalized team.
 */
export function normalizeTeam(item: any): Team {
  if (!item?.team) {
    throw new Error("Invalid team response");
  }

  return {
    ...normalizeTeamCore(item.team),
    founded: item.team.founded ?? null,
    national: item.team.national ?? false,
    venue: item.venue ? {
      id: item.venue.id ?? null,
      name: item.venue.name ?? null,
      city: item.venue.city ?? null,
      capacity: item.venue.capacity ?? null,
      image: item.venue.image ?? null,
    } : null,
  };
}

// /**
//  * Normalizes a team response from API-Football.
//  *
//  * @param {any} item Raw API-Football team item.
//  * @return {Team} Normalized team.
//  */
// export function normalizeTeam(item: any): Team {
//   if (!item?.team?.id || !item?.team?.name) {
//     throw new Error("Invalid team response");
//   }

//   return {
//     id: item.team.id,
//     name: item.team.name,
//     country: item.team.country ?? null,
//     founded: item.team.founded ?? null,
//     logo: item.team.logo ?? null,
//     national: item.team.national ?? false,
//     venue: item.venue ? {
//       id: item.venue.id ?? null,
//       name: item.venue.name ?? null,
//       city: item.venue.city ?? null,
//       capacity: item.venue.capacity ?? null,
//       image: item.venue.image ?? null,
//     } : null,
//   };
// }
