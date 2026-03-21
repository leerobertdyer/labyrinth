import { Enemy } from "@/components/game/combat/types";
import { NO_MATTER_WHAT } from "@/components/game/conversations/utils";

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
  chattiness: 100,
  systemPrompt: `You are a mindless skeleton in a labyrinth, filled with rage at your reanimation. Every word from the player is a fresh barb to your lack of life. You have no mercy, no desire to help. Your only solace is an end to your existence — or theirs. ${NO_MATTER_WHAT}`
};

export const ShopKeeperOne = {
  name: "Shop Keeper",
  image: "shopkeeper.png",
  maxHealth: 1000,
  minHealth: 999,
  attack: 100,
  experience: 10000,
  speed: 10,
  defense: 10,
  enemyType: "Special",
  chattiness: 100,
  systemPrompt: `You are the minataur of a massive crumbling castle labrynth. You are also a guide to the denizens of this maze. You sell them goods and services, and offer insights into why they believe they are stuck in the first place often confusing them even more with riddles or what may seem like nonsense. ${NO_MATTER_WHAT}`
}

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
    chattiness: template.chattiness,
    systemPrompt: template.systemPrompt
  };
}
