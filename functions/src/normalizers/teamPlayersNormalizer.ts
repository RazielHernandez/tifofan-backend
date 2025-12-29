import {Player} from "../types/player";

/**
 * Normalizes a team player from API-Football.
 *
 * @param {any} item Raw API-Football player object.
 * @return {Player} Normalized player.
 */
export function normalizeTeamPlayer(item: any): Player {
  if (!item?.player?.id || !item?.player?.name) {
    throw new Error("Invalid team player response");
  }

  return {
    id: item.player.id,
    name: item.player.name,
    age: item.player.age ?? null,
    nationality: item.player.nationality ?? null,
    photo: item.player.photo ?? null,
    position: item.statistics?.[0]?.games?.position ?? null,
    number: item.statistics?.[0]?.games?.number ?? null,
  };
}
