import { useRef } from "react";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { RigidBody } from "@react-three/rapier";
import { Enemy } from "../../combat/types";

export type EnemyEncounterProps = {
  encounterEnemies: Enemy[];
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
};

export default function EnemyEncounter({
  encounterEnemies,
  position = [0, 0, 0],
  rotation,
  children,
}: EnemyEncounterProps) {
  const [, send] = useGameMachine();
  const isInContactRef = useRef(false);

  return (
    <RigidBody
      type="fixed"
      position={position}
      rotation={rotation}
      onCollisionEnter={({ other }) => {
        if (other.rigidBodyObject?.userData?.type !== "player") return;
        if (!isInContactRef.current) {
          isInContactRef.current = true;
          send({ type: "SET_ENCOUNTER_ENEMIES", encounterEnemies });
          send({ type: "ENTER_COMBAT" });
        }
      }}
      onCollisionExit={({ other }) => {
        if (other.rigidBodyObject?.userData?.type === "player") {
          isInContactRef.current = false;
        }
      }}
    >
      {children}
    </RigidBody>
  );
}