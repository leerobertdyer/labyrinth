import { useRef } from "react";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { RigidBody } from "@react-three/rapier";
import { EncounterConfig } from "@/components/game/types";

// TODO: replace with src/components/game/Encounters/TriggerEvent.tsx

export type EnemyEncounterProps = {
  encounter: EncounterConfig
  children: React.ReactNode;
};

export default function EnemyEncounter({
  encounter,
  children,
}: EnemyEncounterProps) {
  const [, send] = useGameMachine();
  const isInContactRef = useRef(false);

  if (!encounter) return null;
  return (
    <RigidBody
      type="fixed"
      position={encounter.position}
      rotation={encounter.rotation}
      onCollisionEnter={({ other }) => {
        if (other.rigidBodyObject?.userData?.type !== "player") return;
        if (!isInContactRef.current) {
          isInContactRef.current = true;
          send({ type: "ENTER_COMBAT", encounter });
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
