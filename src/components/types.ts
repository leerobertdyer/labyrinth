import { Enemy } from '@/components/game/combat/types';
import { ComponentType } from 'react';
import { AnimationClip, Euler, Vector3 } from 'three'

export type GLTFAction = AnimationClip & {
  name: string
}

export interface IRoomObjects {
  pos: Vector3;
  scale: Vector3;
  rotation: Euler;
  Model: ComponentType<{ position: Vector3; scale?: Vector3; rotation: Euler }>;
  onColide?: () => void;
}

export interface IRoom {
  size: number; // floor grid size
  tileSize: number; // individual tile size
  edges?: WallEdge[]; // optional — default to all walls if omitted
  scale?: Vector3; // optional scale for walls/doors/ceiling height
  roof?: boolean; // optional flag to show sky or not
}

export interface WallEdge {
  direction: "north" | "south" | "east" | "west";
  slots: SlotType[]; // length = number of tiles along that edge
}

export type SlotType = "wall" | "gate" | "empty";

export interface RoomConfig {
  id: string;
  size: number;
  tileSize?: number;
  scale: Vector3;
  edges: { north: WallEdge, south: WallEdge, east: WallEdge, west: WallEdge },
  roomObjects: IRoomObjects[],
  enemies: Enemy[],
  // npcs: type needs implementation
  connections: {
    north?: string;   // what room each gate leads to eg "northern-starting-hall"
    south?: string;   
    east?: string;  
    west?: string;
  }
}