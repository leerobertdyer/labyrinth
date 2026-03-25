import Shopkeeper from "@/components/game/characters/Shopkeeper/Shopkeeper";
import { generateEnemy, ShopKeeperOne } from "@/components/game/combat/enemies";
import { Barrels } from "@/components/game/models/kenney/retroMedieval/barrels";
import { HALLWAY_ONE, STARTING_ROOM } from "@/components/game/Rooms/constants";
import {
  allWalls,
  placeObjects,
  wallsWithGate,
} from "@/components/game/Rooms/roomRegistry";
import { RoomConfig } from "@/components/game/types";
import { Euler, Vector3 } from "three";

const roomLength = 30;
const roomWidth = 10;

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

const shopkeeperStartingPos = new Vector3(1, 0, 17);
const shopkeeperStartingRot = new Vector3(0, Math.PI, 0);

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
      slots: allWalls(roomLength),
    },
  },
  roomObjects: barrels,
  encounters: [
    {
      encounterEnemies: [generateEnemy(ShopKeeperOne)],
      position: [
        shopkeeperStartingPos.x,
        shopkeeperStartingPos.y,
        shopkeeperStartingPos.z,
      ],
      rotation: [
        shopkeeperStartingRot.x,
        shopkeeperStartingRot.y,
        shopkeeperStartingRot.z,
      ],
      entityId: "shopkeeper",
    },
  ],
  entities: [
    {
      id: "shopkeeper",
      position: shopkeeperStartingPos,
      rotation: shopkeeperStartingRot,
      modelScale: 2.5,
      Model: Shopkeeper,
    },
  ],
  connections: {
    south: STARTING_ROOM, // TODO: lead to next room | Random Room....
  },
};
