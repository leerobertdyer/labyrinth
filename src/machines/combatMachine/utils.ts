import { Player } from "@/components/game/combat/types";

export function applyExperienceGain(player: Player, gainedXp: number): Player {
    const currentPlayerLevel = getLevel(player.experience)
    const newXp = player.experience + gainedXp;
    const nextPlayerLevel = getLevel(newXp);
    if (nextPlayerLevel > currentPlayerLevel) player = levelUp(player)

  return {
    ...player,
    experience: newXp,
    // optionally recalculate stats here if level changed
  };
}

function getLevel(totalXp: number): number {
  if (totalXp >= 1200) return 4;
  if (totalXp >= 800) return 3;
  if (totalXp >= 300) return 2;
  return 1;
}

export function levelUp(p: Player) {
    p.attack += 10;
    p.defense += 10;
    p.health += 10;
    p.maxHealth += 10;
    p.health = p.maxHealth;
    p.speed += 10;
    return p;
}