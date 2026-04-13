import { Player } from "@/components/game/combat/types";
import { EncounterConfig } from "@/components/game/types";

export type GameContext = {
  player: Player;
  room: string;
  encounter: EncounterConfig;
  conversation: ConversationTrigger
};

export type GameEvent =
  | { type: "LEVEL_UP"; level: number }
  | { type: "CONFIRM_STATS"; player: Player }
  | { type: "NEW_GAME" }
  | { type: "PLAYER_HIT"; damage: number }
  | { type: "ENTER_COMBAT"; encounter: EncounterConfig }
  | { type: "LEAVE_COMBAT"; player: Player }
  | { type: "VICTORY"; player: Player }
  | { type: "DEFEAT" }
  | { type: "PAUSE" }
  | { type: "UNPAUSE" }
  | { type: "RESPAWN"; room: string }
  | { type: "FLASH_SCREEN"; color: string; intensity: number }
  | { type: "START_TALKING"; conversation: ConversationTrigger; }
  | { type: "FINISH_TALKING" }
  | { type: "COMBAT_LOST" };

export type GameEmit =
  | { type: "FLASH_SCREEN"; color: string; intensity: number }
  | { type: "BATTLE_WON"; encounter: EncounterConfig }
  | { type: "BATTLE_LOST"; encounter: EncounterConfig };

export type ConversationTrigger = {
  npcId: string;
  prompt: string; // Immediate prompt for npc to begin talking
  systemPrompt: string; // NPC character and background
  greeting?: string; // optional hardcoded first line before AI takes over
  narration?: string; // optional setup text for story (also useful for buying time for model response)
}
