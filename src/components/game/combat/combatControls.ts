/**
 * Battle keyboard bindings. Used only when playing.inCombat.
 * Each view (PlayerMenu, Arena, EnemyChat) registers its own keydown listener when it is the active view;
 * they use eventKeyToControl() to map key -> action and handle only the actions they care about.
 * Exploration controls live in app/constants.ts and are consumed via drei KeyboardControls.
 */
import type { CombatViews } from "./types";
import type { Enemy } from "./types";

export interface CombatActorRef {
  getSnapshot(): { context: { enemies: Enemy[]; selectedEnemyId: string | null } };
  send(
    event: { type: "SELECT_ENEMY"; enemyId: string } | { type: "SET_VIEW"; view: CombatViews } | { type: "ATTACK" }
  ): void;
}

export const combatControls = [
  { name: "MENU_UP", keys: ["ArrowUp", "w", "W"] },
  { name: "MENU_LEFT", keys: ["ArrowLeft", "a", "A"] },
  { name: "MENU_DOWN", keys: ["ArrowDown", "s", "S"] },
  { name: "MENU_RIGHT", keys: ["ArrowRight", "d", "D"] },
  { name: "SELECT", keys: [" "] },
  { name: "BACK", keys: ["Backspace"] }
];

export function eventKeyToControl(event: KeyboardEvent) {
  const key = event.key;
  return combatControls.find((control) => control.keys.includes(key))?.name;
}