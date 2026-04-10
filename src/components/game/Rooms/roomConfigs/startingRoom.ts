import { REMOVE_ENCOUNTER } from "@/app/constants";
import Shopkeeper from "@/components/game/characters/Shopkeeper/Shopkeeper";
import {
  generateEnemy,
  ShopKeeperOne,
} from "@/components/game/combat/registry/enemies";
import { BannerRed } from "@/components/game/models/kenney/fantasyTown/banner-red";
import { Barrels } from "@/components/game/models/kenney/retroMedieval/barrels";
import { TorchQ } from "@/components/game/models/quaternius/Torch";
import { HALLWAY_ONE, STARTING_ROOM } from "@/components/game/Rooms/constants";
import {
  allWalls,
  placeObjects,
  wallsWithGate,
} from "@/components/game/Rooms/roomRegistry";
import { RoomConfig } from "@/components/game/types";
import { Euler, Vector3 } from "three";

const roomLength = 40;
const roomWidth = 25;
const roomScale = new Vector3(1.7, 8, 4.5)

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
    new Vector3(-roomWidth / 2 + 1, 0.1, 0),
    new Vector3(-roomWidth / 2 + 1, 0.1, 3),
    new Vector3(-roomWidth / 2 + 1, 0.1, 6),
    new Vector3(-roomWidth / 2 + 1, 0.1, -3),
  ],
);

const banners = placeObjects(
  {
    rotation: new Euler(0, Math.PI / 2, 0),
    scale: new Vector3(4, 4, 4),
    Model: BannerRed,
  },
  [
    new Vector3(roomWidth / 2 - 1, 0.1, 0),
    new Vector3(roomWidth / 2 - 1, 0.1, 3),
    new Vector3(roomWidth / 2 - 1, 0.1, 6),
    new Vector3(roomWidth / 2 - 1, 0.1, 9),
    new Vector3(roomWidth / 2 - 1, 0.1, -3),
    new Vector3(-roomWidth / 2 + 1, 0.1, 0),
    new Vector3(-roomWidth / 2 + 1, 0.1, 3),
    new Vector3(-roomWidth / 2 + 1, 0.1, 6),
    new Vector3(-roomWidth / 2 + 1, 0.1, 9),
    new Vector3(-roomWidth / 2 + 1, 0.1, -3),
  ],
);

const torches = placeObjects(
  {
    rotation: new Euler(0, Math.PI / 2, 0),
    scale: new Vector3(2, 2, 2),
    Model: TorchQ,
  },
  [
    new Vector3(roomWidth / 4 - 3, 0.1, roomLength / 2 - 1),
    new Vector3(-roomWidth / 4 + 5, 0.1, roomLength / 2 - 1),
  ],
);

// const TEST = placeObjects(
//   {
//     rotation: new Euler(0, Math.PI / 2, 0),
//     scale: new Vector3(2, 2, 2),
//     Model: Book2Q,
//   },
//   [
//     new Vector3(roomWidth / 4 - 1, 0.1, 9),
//     new Vector3(-roomWidth / 4 + 1, 0.1, 9),
//   ],
// );

const shopkeeperStartingPos = new Vector3(1, 0, 17);
const shopkeeperStartingRot = new Vector3(0, Math.PI, 0);

export const startingRoom: RoomConfig = {
  id: STARTING_ROOM,
  width: roomWidth,
  length: roomLength,
  tileSize: 1,
  scale: roomScale,
  edges: {
    north: {
      direction: "north",
      slots: allWalls(roomWidth),
    },
    south: {
      direction: "south",
      slots: wallsWithGate(roomWidth, 18, 22),
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
  roomObjects: [
    ...barrels,
    ...banners,
    ...torches,
    // ...TEST
  ],
  triggers: [
    {
      event: { type: "FLASH_SCREEN", color: "blue", intensity: 1},
      collider:  { shape: "cuboid", args: [roomWidth * .5, roomScale.y, 1] },
      position: [0, 0, -4],
      rotation: [0, 0, 0],
      onlyOnce: false,
    }
  ],
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
      // afterPlayerDefeat: REMOVE_ENCOUNTER,
      afterPlayerVictory: REMOVE_ENCOUNTER,
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
    south: HALLWAY_ONE, // what room each gate leads to
  },
};
