import { Player } from "@/components/game/combat/types";

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
    { name: "pause", keys: ["p", "P"] }
];

export const playerSpeed = 8;
export const playerRotateSpeed = 2;
export const playerCamRotateSpeed = 1.5;
export const playerCamRadius = 8;

export const JUMP_STRENGTH = 8;
export const GROUND_RAY_LENGTH = 0.35;
export const GROUND_RAY_ORIGIN_OFFSET = 0.05;

export const MOVEMENT_DISABLED_STATES = ["paused", "dead", "inCombat"];

export const defaultPlayer: Player = {
    health: 100,
    maxHealth: 100,
    experience: 0,
    attack: 10,
    speed: 5,
    defense: 3,
    image: '/sprites/Hero.png'
}