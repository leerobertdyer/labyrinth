import { startingRoom } from "@/components/game/Rooms/roomConfigs/startingRoom";
import { greatHall } from "@/components/game/Rooms/roomConfigs/greatHall";
import { IRoomObjects, RoomConfig, SlotType } from "@/components/game/types";
import { Vector3 } from "three";

export function allWalls(n: number): SlotType[] {
  return Array(n).fill("wall");
}

export function wallsWithGate(n: number, from: number, to: number): SlotType[] {
  return Array(n)
    .fill("wall")
    .map((_: string, i: number) => (i >= from && i <= to ? "gate" : "wall"));
}

export function placeObjects(
  base: Omit<IRoomObjects, "pos">,
  positions: Vector3[],
): IRoomObjects[] {
  return positions.map((pos) => ({ ...base, pos }));
}

export const ROOMS: Record<string, RoomConfig> = {
  startingRoom,
  greatHall,
};
