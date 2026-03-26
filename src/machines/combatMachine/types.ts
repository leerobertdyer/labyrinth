import { Enemy, InventoryItem, Player } from "@/components/game/combat/types";

export type CombatContext = {
  enemies: Enemy[];
  player: Player;
  selectedEnemyId: string | null;
  selectedView: "PLAYER" | "ENEMY" | "CHAT";
  enemyAttackQueue: string[];
};

export type CombatEvent =
  | { type: "NOOP" }
  | { type: "ATTACK" }
  | { type: "DEFEND" }
  | { type: "USE_ITEM"; item: InventoryItem }
  | { type: "FLEE"; success: boolean }
  | { type: "SKIP_TURN" }
  | { type: "SET_VIEW"; view: "PLAYER" | "ENEMY" | "CHAT" }
  | { type: "SELECT_ENEMY"; enemyId: string }
  | { type: "PLAYER_HIT"; damage: number }
  | { type: "HEAL"; amount: number };
