import { CombatViews } from "./types";

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

export const combatControlsHandler = (event: KeyboardEvent, selectedView: CombatViews) => {
    const action = eventKeyToControl(event);
    console.log("Action:", action, "Selected View:", selectedView);
    if (action) {
      switch (selectedView) {
        case "PLAYER":
          switch (action) {
            case "MOVE_UP":
              // Move menu up
              break;
            case "MOVE_DOWN":
              // Move menu down
              break;
            case "SELECT":
              // Select menu item
              break;
            case "BACK":
              // Go back to previous menu
              break;
            default:
              break;
          }
          break;
        case "ENEMY":
          switch (action) {
            case "MOVE_UP":
              // Move enemy menu up
              break;
          }
        case "CHAT":
          switch (action) {
            case "MOVE_UP":
              // Move chat up
              break;
            case "MOVE_DOWN":
              // Move chat down
              break;
          }
          break;
        default:
          break;
      }
    }
  };