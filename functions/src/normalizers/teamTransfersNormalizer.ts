import {
  NormalizedTransfer,
  PlayerBlock,
  Transfer,
} from "../types/transfers";

/**
 * Normalizes team transfer data from a player block.
 *
 * @param {PlayerBlock} playerBlock - Containing player and transfers data.
 * @return {NormalizedTransfer[]} Array of normalized transfer objects.
 */
export function normalizeTeamTransfers(
  playerBlock: PlayerBlock
): NormalizedTransfer[] {
  if (!playerBlock?.player) {
    console.error("Invalid transfer block:", playerBlock);
    return [];
  }

  const player = playerBlock.player;
  const transfers = playerBlock.transfers ?? [];

  return transfers.map((t: Transfer): NormalizedTransfer => ({
    player: {
      id: player?.id ?? 0,
      name: player?.name ?? "Unknown",
      photo: player?.photo ?? "",
    },

    date: t?.date ?? "",

    type: t?.type ?? "Unknown",

    teams: {
      from: {
        id: t?.teams?.out?.id ?? 0,
        name: t?.teams?.out?.name ?? "Unknown",
        logo: t?.teams?.out?.logo ?? "",
      },
      to: {
        id: t?.teams?.in?.id ?? 0,
        name: t?.teams?.in?.name ?? "Unknown",
        logo: t?.teams?.in?.logo ?? "",
      },
    },
  }));
}
