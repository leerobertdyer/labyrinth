// General Game Types

import { EnemyEncounterProps } from '@/components/game/characters/Enemies/EnemyEncounter';
import { Enemy } from '@/components/game/combat/types';
import { ComponentType } from 'react';
import { AnimationClip, Euler, Vector3 } from 'three'

export type GLTFAction = AnimationClip & {
  name: string
}

export type IRoomObjects = {
  pos: Vector3;
  scale: Vector3;
  rotation: Euler;
  Model: ComponentType<{ position: Vector3; scale?: Vector3; rotation: Euler }>;
  onColide?: () => void;
}

export type IRoom = {
  size: number; // floor grid size
  tileSize: number; // individual tile size
  edges?: WallEdge[]; // optional — default to all walls if omitted
  scale?: Vector3; // optional scale for walls/doors/ceiling height
  roof?: boolean; // optional flag to show sky or not
}

export type WallEdge = {
  direction: "north" | "south" | "east" | "west";
  slots: SlotType[]; // length = number of tiles along that edge
}

export type SlotType = "wall" | "gate" | "empty";

export type EncounterConfig = {
  encounterEnemies: Enemy[];
  position: [number, number, number];
  rotation: [number, number, number];
  npcIds: string[];
};

export type RoomConfig = {
  id: string;
  size: number;
  tileSize?: number;
  scale: Vector3;
  edges: { north: WallEdge, south: WallEdge, east: WallEdge, west: WallEdge },
  roomObjects: IRoomObjects[],
  encounters: EncounterConfig[],
  npcs: NPC[],
  connections: {
    north?: string;   // what room each gate leads to eg "northern-starting-hall"
    south?: string;   
    east?: string;  
    west?: string;
  }
}

export type NPC = {
  id: string;
  position: Vector3;
  rotation: Vector3;
  modelScale: number;
  Model: ComponentType<{ position: Vector3, rotation: [number, number, number], scale: number }>
  // name
  // prompt: NPCPrompt // the initial prompt for conversation injection
  // alignment: Alignment // Whether they are friend foe or confused 
  // amnesia: number // may be cool to have the same amnesia status that main character does
  // stats: NPCStats // should the npcs be Fightable!??  INpcStats could extend BattleStats
}