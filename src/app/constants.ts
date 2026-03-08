export const explorationControls = [
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

// export const combatControls = [
//     { name: "UI_UP", keys: ["w", "W"] },
//     { name: "UI_DOWN", keys: ["s", "S"] },
//     { name: "UI_LEFT", keys: ["a", "A"] },
//     { name: "UI_RIGHT", keys: ["d", "D"] },
//     { name: "MENU_LEFT", keys: ["ArrowLeft"] },
//     { name: "MENU_RIGHT", keys: ["ArrowRight"] },
//     { name: "MENU_UP", keys: ["ArrowUp"] },
//     { name: "MENU_DOWN", keys: ["ArrowDown"] },
//     { name: "MENU_SELECT", keys: [" "] },
//     { name: "MENU_BACK", keys: ["Backspace"] }
// ];

export const playerSpeed = 8;
export const playerRotateSpeed = 2;
export const playerCamRotateSpeed = 1.5;
export const playerCamRadius = 8;

export const JUMP_STRENGTH = 8;
export const GROUND_RAY_LENGTH = 0.35;
export const GROUND_RAY_ORIGIN_OFFSET = 0.05;

export const MOVEMENT_DISABLED_STATES = ["paused", "dead", "inCombat"];