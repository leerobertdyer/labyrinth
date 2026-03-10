import { Player } from "@/components/game/combat/types";

export function calculateIncomingDamage(
  player: Player,
  isPlayerActivelyDefending: boolean,
  rawDamage: number,
): number {
  const defenseBuffer = player.defense * (isPlayerActivelyDefending ? 2 : 1);
  return Math.max(0, rawDamage - defenseBuffer);
}
