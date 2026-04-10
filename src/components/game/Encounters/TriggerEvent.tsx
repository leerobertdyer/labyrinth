import { useRef } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useGameMachine } from "@/contexts/GameMachineContext";
import type { Vector3Tuple, EulerTuple } from "three";
import { GameEvent } from "@/machines/gameMachine/types";

type TriggerShape =
  | { shape: "cuboid"; args: [number, number, number] } // half-extents: [w, h, d]
  | { shape: "plane"; args: [number, number] }; // half-extents: [w, d], height ~= 0
// TODO add more shapes?

export type TriggerEventProps = {
  event: GameEvent;
  position?: Vector3Tuple;
  rotation?: EulerTuple;
  collider: TriggerShape;
  onlyOnce?: boolean;
  filterType?: string; // userData.type that must match, e.g. "player"
  children?: React.ReactNode; // optional visible mesh
};

export default function TriggerEvent({
  event,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  collider,
  onlyOnce = false,
  filterType = "player",
  children,
}: TriggerEventProps) {
  const [, send] = useGameMachine();
  const isInContactRef = useRef(false);
  const firedRef = useRef(false);

  const colliderArgs =
    collider.shape === "plane"
      ? [collider.args[0], 0.05, collider.args[1]] // thin cuboid acts as a plane
      : collider.args;

  return (
    <RigidBody
      type="fixed"
      sensor // <-- key: no physics response, just overlap events
      position={position}
      rotation={rotation}
      onIntersectionEnter={({ other }) => {
        if (filterType && other.rigidBodyObject?.userData?.type !== filterType)
          return;
        if (onlyOnce && firedRef.current) return;
        if (!isInContactRef.current) {
          isInContactRef.current = true;
          firedRef.current = true;
          send(event);
        }
      }}
      onIntersectionExit={({ other }) => {
        if (other.rigidBodyObject?.userData?.type === filterType) {
          isInContactRef.current = false;
        }
      }}
    >
      <CuboidCollider args={colliderArgs as [number, number, number]} />
      {children}
    </RigidBody>
  );
}

/* EXAMPLES

// Invisible room transition line
<TriggerEvent
  event={{ type: "ENTER_NEXT_ROOM", roomId: "dungeon-2" }} // TODO - perhaps this would be better than my store?
  position={[0, 1, -10]}
  collider={{ shape: "plane", args: [5, 2] }}
/>

// NPC bump-to-talk
<TriggerEvent
  event={{ type: "START_DIALOGUE", npcId: "merchant" }}
  position={npc.position}
  collider={{ shape: "cuboid", args: [0.8, 1, 0.8] }}
>
  <MerchantMesh />
</TriggerEvent>

// Auto-pickup item
<TriggerEvent
  event={{ type: "PICKUP_ITEM", itemId: "health-mushroom" }}
  position={item.position}
  collider={{ shape: "cuboid", args: [0.4, 0.4, 0.4] }}
  onlyOnce
>
  <MushroomMesh />
</TriggerEvent>


*/
