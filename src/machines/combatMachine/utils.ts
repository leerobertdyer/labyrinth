import { Player } from "@/components/game/combat/types";

export function applyExperienceGain(player: Player, gainedXp: number): Player {
    const currentPlayerLevel = getPlayerLevel(player.experience)
    const newXp = player.experience + gainedXp;
    const nextPlayerLevel = getPlayerLevel(newXp);
    if (nextPlayerLevel > currentPlayerLevel) player = levelUp(player)

  return {
    ...player,
    experience: newXp,
    // optionally recalculate stats here if level changed
  };
}



export function getPlayerLevel(totalXp: number): number {
  if (totalXp >= 1200) return 4;
  if (totalXp >= 800) return 3;
  if (totalXp >= 300) return 2;
  return 1;
}

export function levelUp(p: Player) {
    p.health += 5
    p.unspentPoints += 10;
    return p;
}