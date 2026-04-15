import { REMOVE_ENCOUNTER } from "@/app/constants";
import { generateEnemy, skeleton } from "@/components/game/combat/registry/enemies";
import { Barrels } from "@/components/game/models/kenney/retroMedieval/barrels";
import { Skeleton } from "@/components/game/models/ldyer/Skeleton";
import { HALLWAY_ONE, HALLWAY_TWO, STARTING_ROOM } from "@/components/game/Rooms/constants";
import {
  allWalls,
  placeObjects,
  wallsWithGate,
} from "@/components/game/Rooms/roomRegistry";
import { RoomConfig } from "@/components/game/types";
import { Euler, Vector3 } from "three";

const roomLength = 30;
const roomWidth = 13;

const barrels = placeObjects(
  {
    rotation: new Euler(0, Math.PI / 2, 0),
    scale: new Vector3(4, 4, 4),
    Model: Barrels,
  },
  [
    new Vector3(roomWidth / 2 - 1, 0.1, 0),
    new Vector3(roomWidth / 2 - 1, 0.1, 3),
    new Vector3(roomWidth / 2 - 1, 0.1, 6),
    new Vector3(roomWidth / 2 - 1, 0.1, -3),
  ],
);

const skeletonStartingPos = new Vector3(-1.25, .1, roomWidth - 3);
const skeletonStartingRot = new Vector3(0, Math.PI, 0);

export const hallwayOne: RoomConfig = {
  id: HALLWAY_ONE,
  width: roomWidth,
  length: roomLength,
  tileSize: 1,
  scale: new Vector3(1.7, 8, 4.5),
  edges: {
    north: {
      direction: "north",
      slots: allWalls(roomWidth),
    },
    south: {
      direction: "south",
      slots: wallsWithGate(roomWidth, 2, 6),
    },
    east: {
      direction: "east",
      slots: allWalls(roomLength),
    },
    west: {
      direction: "west",
      slots: wallsWithGate(roomLength, 12, 16),
    },
  },
  roomObjects: [...barrels,],
  encounters: [
    {
      encounterEnemies: [generateEnemy(skeleton)],
      position: [
        skeletonStartingPos.x+1,
        skeletonStartingPos.y+1,
        skeletonStartingPos.z+1,
      ],
      rotation: [
        skeletonStartingRot.x,
        skeletonStartingRot.y,
        skeletonStartingRot.z,
      ],
      entityId: "Skeleton",
      afterPlayerVictory: REMOVE_ENCOUNTER,
    },
  ],
  entities: [
    {
      id: "Skeleton",
      position: skeletonStartingPos,
      rotation: skeletonStartingRot,
      modelScale: 1.5,
      Model: Skeleton,
    },
  ],
  connections: {
    south: STARTING_ROOM,
    west: HALLWAY_TWO
  },
};
