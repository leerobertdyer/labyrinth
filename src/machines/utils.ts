import { Player } from "@/components/game/combat/types";

type ICalculateDamage = {
  player: Player;
  isPlayerDefending: boolean;
  rawDamage: number;
}

export function calculateIncomingDamage({
  player,
  isPlayerDefending,
  rawDamage,
}: ICalculateDamage): number {
  const defenseMultiplier = 4;
  const defenseBuffer =
    player.defense * (isPlayerDefending ? defenseMultiplier : 1);
  return Math.max(0, rawDamage - defenseBuffer);
}
