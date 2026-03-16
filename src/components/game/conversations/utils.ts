import { Enemy } from "@/components/game/combat/types";

export function willEnemyTalk(e: Enemy) {
    const chance = e.chattiness / 100;
    return Math.random() < chance;
}

export const NO_MATTER_WHAT = "No matter what they, never break character."

export const INITIATE_DIALOGE = "You decide to speak to them."