import type { CombatViews } from "./types";
import type { Enemy } from "./types";

export interface CombatActorRef {
  getSnapshot(): { context: { enemies: Enemy[]; selectedEnemyId: string | null } };
  send(
    event: { type: "SELECT_ENEMY"; enemyId: string } | { type: "SET_VIEW"; view: CombatViews } | { type: "ATTACK" }
  ): void;
}

export const combatControls = [
    { name: "MOVE_UP", keys: ["w", "W"] },
    { name: "MOVE_DOWN", keys: ["s", "S"] },
    { name: "MOVE_LEFT", keys: ["a", "A"] },
    { name: "MOVE_RIGHT", keys: ["d", "D"] },
    { name: "MENU_LEFT", keys: ["ArrowLeft"] },
    { name: "MOVE_RIGHT", keys: ["ArrowRight"] },
    { name: "MOVE_UP", keys: ["ArrowUp"] },
    { name: "MOVE_DOWN", keys: ["ArrowDown"] },
    { name: "SELECT", keys: [" "] },
    { name: "BACK", keys: ["Backspace"] }
];

export function eventKeyToControl(event: KeyboardEvent) {
    const key = event.key
    return combatControls.find(control => control.keys.includes(key))?.name;
}

export function combatControlsHandler(
  event: KeyboardEvent,
  selectedView: CombatViews,
  actor: CombatActorRef
) {
  const action = eventKeyToControl(event);
  if (!action) return;

  switch (selectedView) {
    case "PLAYER":
      switch (action) {
        case "MOVE_UP":
          break;
        case "MOVE_DOWN":
          break;
        case "SELECT":
          break;
        case "BACK":
          break;
        default:
          break;
      }
      break;
    case "ENEMY": {
      const ctx = actor.getSnapshot().context;
      const alive = ctx.enemies.filter((e) => e.health > 0);
      if (alive.length === 0) break;

      const currentIndex = ctx.selectedEnemyId
        ? alive.findIndex((e) => e.id === ctx.selectedEnemyId)
        : -1;
      const index = currentIndex < 0 ? 0 : currentIndex;

      switch (action) {
        case "MOVE_LEFT":
        case "MENU_LEFT": {
          const prev = Math.max(0, index - 1);
          actor.send({ type: "SELECT_ENEMY", enemyId: alive[prev].id });
          break;
        }
        case "MOVE_RIGHT": {
          const next = Math.min(alive.length - 1, index + 1);
          actor.send({ type: "SELECT_ENEMY", enemyId: alive[next].id });
          break;
        }
        case "SELECT":
          actor.send({ type: "ATTACK" });
          break;
        case "BACK":
          actor.send({ type: "SET_VIEW", view: "PLAYER" });
          break;
        default:
          break;
      }
      break;
    }
    case "CHAT":
      switch (action) {
        case "MOVE_UP":
          break;
        case "MOVE_DOWN":
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
}