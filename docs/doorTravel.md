# Door Travel — Room Transition Implementation Guide

## Overview

When a player walks through a gate, we need to:
1. Detect the crossing via a physics sensor
2. Look up the destination room
3. Teleport the player to the correct spawn point
4. Swap the active room in state

---

## 1. State: Where Does Current Room Live?

**Recommendation: Zustand slice** (or a dedicated navigation slice in your XState machine if you want room transitions modeled as proper states).

Zustand is lower friction to wire first. XState is the better long-term home if you want "transitioning" as a real state that blocks input, plays a fade, etc.

```ts
// store/useRoomStore.ts
interface RoomStore {
  currentRoomId: string;
  transitionTo: (roomId: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  currentRoomId: "greatHall",
  transitionTo: (roomId) => set({ currentRoomId: roomId }),
}));
```

---

## 2. Room Registry

You need a lookup from `roomId → RoomConfig`. Centralize this.

```ts
// Rooms/roomRegistry.ts
import { greatHall } from "./greatHall";
import { RoomConfig } from "@/components/game/types";

export const ROOM_REGISTRY: Record<string, RoomConfig> = {
  greatHall,
  // nextRoom,
};
```

---

## 3. Spawn Points Per Room

Each `RoomConfig` needs spawn points keyed by the direction the player *arrives from*. If you enter through the south gate, you spawn near the north wall of the new room (you came in the south exit of the old room, so you arrive at the south entrance of the next — spawn just inside it, facing inward).

```ts
// types.ts addition
interface RoomConfig {
  // ...existing fields
  spawnPoints: Partial<Record<"north" | "south" | "east" | "west", Vector3>>;
}
```

```ts
// greatHall.ts addition
spawnPoints: {
  south: new Vector3(0, 0, roomLength / 2 - 2), // just inside south gate
  north: new Vector3(0, 0, -(roomLength / 2 - 2)),
},
```

**Direction mapping:** arriving through a `south` connection means you entered via the south gate of the *destination* room, so use the `south` spawn point.

---

## 4. Gate Sensor Colliders in Room.tsx

Gates currently have no collider at all (wall runs skip `"gate"` slots). Add a **sensor** `CuboidCollider` in the gap so the player can still walk through but the overlap event fires.

```tsx
{/* Gate sensors — one per contiguous gate run */}
{resolvedEdges.map((edge) =>
  getEdgeRuns(edge.slots, "gate").map(({ start, end }) => {
    const runTiles = end - start;
    const isNS = edge.direction === "north" || edge.direction === "south";
    const half = isNS ? halfWidth : halfLength;
    const runCenter =
      start * tileSize + (runTiles * tileSize) / 2 - half;

    const position: [number, number, number] = isNS
      ? [
          runCenter,
          scale.y / 2,
          edge.direction === "north" ? -halfLength : halfLength,
        ]
      : [
          edge.direction === "east" ? halfWidth : -halfWidth,
          scale.y / 2,
          runCenter,
        ];

    const args: [number, number, number] = isNS
      ? [(tileSize * runTiles) / 2, scale.y, scale.z]
      : [scale.z, scale.y, (tileSize * runTiles) / 2];

    return (
      <CuboidCollider
        key={`${edge.direction}-gate-sensor-${start}`}
        args={args}
        position={position}
        sensor
        onIntersectionEnter={() =>
          onGateEnter?.(edge.direction as "north" | "south" | "east" | "west")
        }
      />
    );
  }),
)}
```

Pass `onGateEnter` as a prop down from RoomManager:

```ts
// types.ts addition
interface IRoom {
  // ...existing
  onGateEnter?: (direction: "north" | "south" | "east" | "west") => void;
}
```

---

## 5. RoomManager

RoomManager owns the transition logic. It reads the current room from Zustand, resolves its config, and passes the gate handler down.

```tsx
// RoomManager.tsx
export default function RoomManager() {
  const { currentRoomId, transitionTo } = useRoomStore();
  const roomConfig = ROOM_REGISTRY[currentRoomId];

  const handleGateEnter = (direction: "north" | "south" | "east" | "west") => {
    const destinationId = roomConfig.connections?.[direction];
    if (!destinationId) return;

    const destination = ROOM_REGISTRY[destinationId];
    const spawnPoint = destination.spawnPoints?.[direction] ?? new Vector3(0, 0, 0);

    teleportPlayer(spawnPoint); // see §6
    transitionTo(destinationId);
  };

  return (
    <Room
      {...roomConfig}
      onGateEnter={handleGateEnter}
    />
  );
}
```

---

## 6. Teleporting the Player

You need a ref to the Rapier `RigidBody` for the player. On teleport, set translation and zero out velocity — otherwise carry-over momentum sends the player flying.

```tsx
// In your player component
const playerRef = useRef<RapierRigidBody>(null);

// Expose via a store or callback
export function teleportPlayer(position: Vector3) {
  const rb = playerRef.current;
  if (!rb) return;
  rb.setTranslation({ x: position.x, y: position.y, z: position.z }, true);
  rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
  rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
}
```

The cleanest pattern: store `playerRef` in Zustand (as a ref, not reactive state) or use a small imperative store so RoomManager can call teleport without prop drilling.

---

## 7. Transition Polish (Stub Now, Fill Later)

Even before you build the portal visual, stub out a `"transitioning"` state to prevent double-fires and prep for a fade:

```ts
interface RoomStore {
  currentRoomId: string;
  isTransitioning: boolean;
  transitionTo: (roomId: string) => void;
}
```

In `handleGateEnter`, guard with `if (isTransitioning) return` and set it true for the duration. This prevents the sensor firing multiple times as the player walks through.

---

## Implementation Order

1. Add `spawnPoints` to `RoomConfig` type and all existing room configs
2. Create `ROOM_REGISTRY`
3. Add Zustand room store
4. Add `onGateEnter` prop + gate sensors to `Room.tsx`
5. Build `RoomManager` with transition logic
6. Wire player teleport (requires exposing player `RigidBody` ref)
7. Add `isTransitioning` guard
8. *(Later)* Portal visual, fade transition, XState integration
