import { Enemy } from "@/components/game/combat/types";

export const skeleton = {
  name: "Skeleton",
  image: "Skeleton1.png",
  maxHealth: 100,
  minHealth: 35,
  attack: 8,
  experience: 100,
  speed: 3,
  defense: 2,
  enemyType: "Skeleton",
  chattiness: 100
};

type IGenerateEnemy = Omit<Enemy, "id" | "selected" | "health" | "maxHealth"> & {
  minHealth: number;
  maxHealth: number;
}

export function generateEnemy(template: IGenerateEnemy): Enemy {
  const randomMaxHealth = Math.ceil(
    Math.max(template.minHealth, Math.random() * template.maxHealth),
  );
  return {
    id: crypto.randomUUID(),
    image: template.image,
    name: template.name,
    health: randomMaxHealth,
    maxHealth: randomMaxHealth,
    experience: template.experience,
    attack: template.attack,
    selected: false,
    speed: template.speed,
    defense: template.speed,
    enemyType: template.enemyType,
    chattiness: template.chattiness
  };
}
