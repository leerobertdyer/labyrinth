import { skeleton1, skeleton2, skeleton3 } from "@/components/game/combat/enemies";
import { Barrels } from "@/components/game/models/kenney/retroMedieval/barrels";
import { allWalls, placeObjects, wallsWithGate } from "@/components/game/Rooms/roomRegistry";
import { RoomConfig } from "@/components/types";
import { Euler, Vector3 } from "three";

const roomSize = 40

const barrels = placeObjects(
  { rotation: new Euler(0, Math.PI / 2, 0), scale: new Vector3(4, 4, 4), Model: Barrels },
  [
    new Vector3(roomSize / 2 - 1, 0.1,  0),
    new Vector3(roomSize / 2 - 1, 0.1,  3),
    new Vector3(roomSize / 2 - 1, 0.1,  6),
    new Vector3(roomSize / 2 - 1, 0.1, -3),
  ]
);

export const startingRoom: RoomConfig = {
  id: "entrance",
  size: roomSize,
  tileSize: 1,
  scale: new Vector3(1.7, 6, 4.5),
  edges: {
    north: 
      {
        direction: "north",
        slots: allWalls(roomSize),
      },
    south:
      {
        direction: "south",
        slots: wallsWithGate(roomSize, 18, 22)
      },
    east:
      {
        direction: "east",
        slots: allWalls(roomSize)
      },
    west: {
        direction: 'west',
        slots: allWalls(roomSize)
    },
  },
  roomObjects: barrels,
  enemies: [skeleton1, skeleton2, skeleton3],
//   npcs: [{ type: "shopkeeper", position: new Vector3(18, 0, 0) }],
  connections: {
    south: "great-hall", // what room each gate leads to
  },
};
