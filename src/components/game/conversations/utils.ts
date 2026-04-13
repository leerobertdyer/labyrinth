import { Enemy } from "@/components/game/combat/types";

export function willEnemyTalk(e: Enemy) {
    const chance = e.chattiness / 100;
    return Math.random() < chance;
}
