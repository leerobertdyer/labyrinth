import { useRef } from "react";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Enemy } from "../../combat/types";

type EnemyEncounterProps = React.ComponentProps<"group"> & {
  encounterEnemies: Enemy[];
};

export default function EnemyEncounter(props: EnemyEncounterProps) {
  const [, send] = useGameMachine();
  const isInContactRef = useRef(false);

  // Pass position/rotation directly to RigidBody so the physics body is definitely at the right place
  const position: [number, number, number] =
    Array.isArray(props.position) && props.position.length === 3
      ? [props.position[0], props.position[1], props.position[2]]
      : [0, 1, 0];
  const rotation: [number, number, number] | undefined =
    Array.isArray(props.rotation) && props.rotation.length === 3
      ? [props.rotation[0], props.rotation[1], props.rotation[2]]
      : undefined;

  return (
    <RigidBody
      type="dynamic"
      position={position}
      rotation={rotation}
      friction={0.2}
      mass={0.1}
      restitution={0.2}
      onCollisionEnter={({ other }) => {
        const isPlayer = other.rigidBodyObject?.userData?.type === "player";
        if (!isPlayer) return;
        if (!isInContactRef.current) {
          isInContactRef.current = true;
          send({ type: "SET_ENCOUNTER_ENEMIES", encounterEnemies: props.encounterEnemies });
          send({ type: "ENTER_COMBAT"});
        }
      }}
      onCollisionExit={({ other }) => {
        if (other.rigidBodyObject?.userData?.type === "player") {
          isInContactRef.current = false;
        }
      }}
    >
      <CuboidCollider args={[1.25, 1.25, 1.25]} position={[0, 0, 0]} />
      <mesh scale={2}>
        <boxGeometry />
        <meshBasicMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}
