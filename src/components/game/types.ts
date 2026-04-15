// General Game Types

import { Enemy } from "@/components/game/combat/types";
import { TriggerEventProps } from "@/components/game/TriggerEvent/TriggerEvent";
import { ComponentType } from "react";
import { AnimationClip, Euler, Vector3 } from "three";

export type GLTFAction = AnimationClip & {
  name: string;
};

export type IRoomObjects = {
  pos: Vector3;
  scale: Vector3;
  rotation: Euler;
  Model: ComponentType<{ position: Vector3; scale?: Vector3; rotation: Euler }>;
  onColide?: () => void;
};

export type IRoom = {
  width: number; // east-west amount of WallEdges (x axis)
  length: number; // north-south amount of WallEdges (z axis)
  tileSize: number; // individual tile size
  edges?: WallEdge[]; // optional — default to all walls if omitted
  scale?: Vector3; // optional scale for walls/doors/ceiling height
  showRoof?: boolean; // optional flag to show sky or not
  onGateEnter?: (direction: Direction) => void; // trigger teleport | room exit
  triggers?: TriggerEventProps[]
};
export type Direction = "north" | "south" | "east" | "west";
export type WallEdge = {
  direction: Direction;
  slots: SlotType[]; // length = number of tiles along that edge
};

export type SlotType = "wall" | "gate" | "empty";

export type EncounterConfig = {
  encounterEnemies: Enemy[];
  position: [number, number, number];
  rotation: [number, number, number];
  entityId: string;
  afterPlayerDefeat?: string; // TODO: Make union type
  afterPlayerVictory?: string; // TODO: Make union type
};
export type RoomConfig = Omit<IRoom, "edges"> & {
  id: string;
  edges: { north: WallEdge; south: WallEdge; east: WallEdge; west: WallEdge };
  roomObjects: IRoomObjects[];
  encounters: EncounterConfig[];
  entities: Entities[]; // Npcs | Enemies | Encounter Objects | Models
  connections: {
    north?: string; // what room each gate leads to eg "northern-starting-hall"
    south?: string;
    east?: string;
    west?: string;
  };
};

export type Entities = {
  id: string;
  position: Vector3;
  rotation: Vector3;
  modelScale: number;
  Model: ComponentType<{
    position: Vector3;
    rotation: [number, number, number];
    scale: number;
  }>;
  // name
  // prompt: EntityPrompt // the initial prompt for conversation injection
  // alignment: Alignment // Whether they are friend foe or confused
  // amnesia: number // may be cool to have the same amnesia status that main character does
  // stats: CombatStats
};
