import {
  generateConsumable,
  minorHealthPotion,
  skipTurn,
} from "@/components/game/combat/registry/consumables";
import { Player } from "@/components/game/combat/types";
import { Vector3 } from "three";

export const explorationControls = [
  { name: "moveForward", keys: ["w", "W"] },
  { name: "moveBackward", keys: ["s", "S"] },
  { name: "strafeLeft", keys: ["a", "A"] },
  { name: "strafeRight", keys: ["d", "D"] },
  { name: "rotateLeft", keys: ["ArrowLeft", "j", "J"] },
  { name: "rotateRight", keys: ["ArrowRight", "l", "L"] },
  { name: "camUp", keys: ["ArrowUp", "i", "I"] },
  { name: "camDown", keys: ["ArrowDown", "k", "K"] },
  { name: "jump", keys: ["Space"] },
  { name: "pause", keys: ["p", "P"] },
];

export const playerRotateSpeed = 2;
export const playerCamRotateSpeed = 1.5;
export const playerCamRadius = 6;
export const STARTING_POINT = new Vector3(0, 0.1, -8);
export const BLUE = "#3983c4";
export const RED = "#b5040f";

export const JUMP_STRENGTH = 8;
export const GROUND_RAY_LENGTH = 0.35;
export const GROUND_RAY_ORIGIN_OFFSET = 0.05;

export const MOVEMENT_DISABLED_STATES = ["paused", "dead", "inCombat", "talking"];

export const startingPlayer: Player = {
  health: 30,
  maxHealth: 30,
  experience: 0,
  attack: 5,
  speed: 7,
  defense: 1,
  image: "/sprites/Hero.png",
  isDefending: false,
  inventory: [
    { item: generateConsumable(minorHealthPotion), quantity: 1 },
    {
      item: generateConsumable(skipTurn),
      quantity: 1,
    },
  ],
  unspentPoints: 5
};

export const REMOVE_ENCOUNTER = "REMOVE_ENCOUNTER";
export const MOVE_NPC = "MOVE_NPC";
export const REMOVE_NPC = "REMOVE_NPC";
export const SHOW_NPC = "SHOW_NPC";

export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 1000,
  3: 2000,
  4: 5000,
  5: 12000,
  6: 20000,
  7: 50000,
  8: 75000,
  9: 110000,
};