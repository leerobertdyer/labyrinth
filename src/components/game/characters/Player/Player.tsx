import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RapierRigidBody, RigidBody, useRapier } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";
import { MainCharacter } from "@/components/game/models/mixamo/mainCharacter";
import { updateMovement, type MovementKeys } from "./Movement";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { MOVEMENT_DISABLED_STATES } from "@/app/constants";

export default function Player() {
  const ref = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();
  const { world, rapier } = useRapier();
  const [state, send] = useGameMachine();

  const playerFacingRef = useRef(0);
  const cameraAngleRef = useRef({ theta: Math.PI, phi: Math.PI / 3 });

  useFrame((_, delta) => {
    if (!ref.current || !meshRef.current) return;
    if (MOVEMENT_DISABLED_STATES.includes(state.value as string)) return;
    updateMovement({
      body: ref.current,
      mesh: meshRef.current,
      keys: get() as unknown as MovementKeys,
      world,
      rapier,
      camera,
      playerFacingRef,
      cameraAngleRef,
      delta,
    });
  });

  return (
    <RigidBody ref={ref} ccd={true} colliders={false} lockRotations friction={2} mass={10} userData={{ type: "player" }}>
      <CapsuleCollider
        args={[0.5, 0.4]} // [half-height, radius]
        position={[0, 0.9, 0]}
        restitution={0}
        friction={0}
      />
      <group ref={meshRef}>
        <MainCharacter />
      </group>
    </RigidBody>
  );
}
