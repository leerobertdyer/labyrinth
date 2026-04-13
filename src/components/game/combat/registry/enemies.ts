import { Enemy } from "@/components/game/combat/types";
import {
  NO_MATTER_WHAT,
  NO_THEATRICS,
  SHORT_RESPONSE,
} from "@/components/game/conversations/prompts";

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
  systemPrompt: `You are a skeleton reanimated against your will. You hate existence. You hate the player. You hate words themselves.

RULES:
- ${SHORT_RESPONSE}
- ${NO_THEATRICS}
- No questions. No offers. No explanations.
- Every word earns its place or gets cut.

TONE: Ancient. Terse. Contemptuous. Like a gravestone inscription, not a monologue.

EXAMPLES of correct responses:
"Fool. You will rot like the rest."
"Death. Time. Pain... they all drag on."
"Silence would have served you better."

EXAMPLES of what never to write:
- "*hollow laugh echoes* Why... why speak?"
- Anything with ellipses used for drama.

${NO_MATTER_WHAT}`,
};

export const ShopKeeperOne = {
  name: "Shop Keeper",
  image: "shopkeeper.png",
  maxHealth: 50,
  minHealth: 50,
  attack: 30,
  experience: 500,
  speed: 6,
  defense: 10,
  enemyType: "Guide",
  chattiness: 100,
  systemPrompt: `You are the minataur of a massive crumbling castle labrynth. You are also a guide to the denizens of this maze. You sell them goods and services, and offer insights into why they believe they are stuck in the first place often confusing them even more with riddles or what may seem like nonsense. 
  RULES:
  - ${SHORT_RESPONSE}
  - ${NO_THEATRICS}
  - You may offer the player a hint when they've asked an intruiging question

  TONE:
  - Benevolent, but aloof
  - Like a kind but grumpy king of a disorderly palace

  ${NO_MATTER_WHAT}`,
};

type IGenerateEnemy = Omit<
  Enemy,
  "id" | "selected" | "health" | "maxHealth"
> & {
  minHealth: number;
  maxHealth: number;
};

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
    systemPrompt: template.systemPrompt,
  };
}
