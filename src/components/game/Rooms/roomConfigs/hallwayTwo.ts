import { MIDDLE_ROOM, HALLWAY_TWO } from "@/components/game/Rooms/constants";
import { allWalls, wallsWithGate } from "@/components/game/Rooms/roomRegistry";
import { RoomConfig } from "@/components/game/types";
import { Vector3 } from "three";

const roomLength = 30;
const roomWidth = 10;

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
  encounters: [],
  entities: [],
  connections: {
    south: MIDDLE_ROOM,
    north: HALLWAY_TWO,
  },
};
