import { REMOVE_ENCOUNTER } from "@/app/constants";
import { generateEnemy, lostSoul } from "@/components/game/combat/registry/enemies";
import { LostSoul } from "@/components/game/models/mixamo/LostSoul";
import { MIDDLE_ROOM, HALLWAY_TWO } from "@/components/game/Rooms/constants";
import {
  allWalls,
//   placeObjects,
  wallsWithGate,
} from "@/components/game/Rooms/roomRegistry";
import { RoomConfig } from "@/components/game/types";
import { 
    // Euler, 
    Vector3 } from "three";

const roomLength = 30;
const roomWidth = 10;

// const barrels = placeObjects(
//   {
//     rotation: new Euler(0, Math.PI / 2, 0),
//     scale: new Vector3(4, 4, 4),
//     Model: Barrels,
//   },
//   [
//     new Vector3(roomWidth / 2 - 1, 0.1, 0),
//     new Vector3(roomWidth / 2 - 1, 0.1, 3),
//     new Vector3(roomWidth / 2 - 1, 0.1, 6),
//     new Vector3(roomWidth / 2 - 1, 0.1, -3),
//   ],
// );

const lostSoulStartingPos = new Vector3(0, .1, 3);
const lostSoulStartingRot = new Vector3(0, Math.PI, 0);

export const hallwayTwo: RoomConfig = {
  id: HALLWAY_TWO,
  width: roomWidth,
  length: roomLength,
  tileSize: 1,
  scale: new Vector3(1.7, 8, 4.5),
  edges: {
    north: {
      direction: "north",
      slots: wallsWithGate(roomWidth, 2, 6),
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
      slots: allWalls(roomLength),
    },
  },
  roomObjects: [],
  encounters: [
    {
      encounterEnemies: [generateEnemy(lostSoul)],
      position: [
        lostSoulStartingPos.x+1,
        lostSoulStartingPos.y+1,
        lostSoulStartingPos.z+1,
      ],
      rotation: [
        lostSoulStartingRot.x,
        lostSoulStartingRot.y,
        lostSoulStartingRot.z,
      ],
      entityId: "LostSoul1",
      afterPlayerVictory: REMOVE_ENCOUNTER,
    },
  ],
  entities: [
    {
      id: "LostSoul1",
      position: lostSoulStartingPos,
      rotation: lostSoulStartingRot,
      modelScale: 1.5,
      Model: LostSoul,
    },
  ],
  connections: {
    south: MIDDLE_ROOM,
    north: HALLWAY_TWO
  },
};
