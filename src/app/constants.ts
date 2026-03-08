export const controls = [
    { name: "moveForward", keys: ["w", "W"] },
    { name: "moveBackward", keys: ["s", "S"] },
    { name: "strafeLeft", keys: ["a", "A"] },
    { name: "strafeRight", keys: ["d", "D"] },
    { name: "rotateLeft", keys: ["ArrowLeft"] },
    { name: "rotateRight", keys: ["ArrowRight"] },
    { name: "camUp", keys: ["ArrowUp"] },
    { name: "camDown", keys: ["ArrowDown"] },
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

export const MOVEMENT_DISABLED_STATES = ["paused", "dead", "combat"];