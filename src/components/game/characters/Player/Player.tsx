import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import { RefObject, useEffect, useRef } from "react";
import { MainCharacter } from "@/components/game/models/mixamo/mainCharacter";
import { updateMovement, type MovementKeys } from "./Movement";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { MOVEMENT_DISABLED_STATES } from "@/app/constants";
import { useDebugStore } from "@/stores/useDebugStore";
import { Group, Vector3 } from "three";
import { usePlayerStore } from "@/stores/usePlayerStore";

export default function Player() {
  const { ref } = usePlayerStore();
  const setPlayerPos = useDebugStore((s) => s.setPlayerPos);
  const meshRef = useRef<Group>(null);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();
  const { world, rapier } = useRapier();
  const [state] = useGameMachine();

  const playerFacingRef = useRef(0);
  const cameraAngleRef = useRef({ theta: Math.PI, phi: Math.PI / 3 });

  useFrame((_, delta) => {
    const playingState = (state.value as { playing?: string }).playing;
    if (
      !playingState ||
      !ref.current ||
      !meshRef.current ||
      MOVEMENT_DISABLED_STATES.includes(playingState)
    )
      return;
    const pos = ref.current.translation();
    setPlayerPos({
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      z: Math.round(pos.z),
    });
    updateMovement({
      body: ref.current,
      mesh: meshRef.current,
      keys: get() as MovementKeys,
      world,
      rapier,
      camera,
      playerFacingRef,
      cameraAngleRef,
      delta,
    });
  });

  useEffect(() => {
    if (ref.current && state.matches({ playing: "dead" })) {
      ref.current.setTranslation(new Vector3(0), false);
    }
  }, [ref, state]);

  return (
    <RigidBody
      ref={ref}
      ccd={true}
      colliders={false}
      lockRotations
      friction={2}
      mass={10}
      userData={{ type: "player" }}
    >
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
