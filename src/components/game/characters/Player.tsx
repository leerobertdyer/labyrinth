import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";
import { MainCharacter } from "@/components/game/models/mixamo/mainCharacter";

export default function Player() {
  const ref = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();

  const speed = 8;
  const rotateSpeed = 2;
  const camRotateSpeed = 1.5;
  const cameraRadius = 8;

  // playerFacing = world-space Y angle the mesh is pointing
  // theta = camera's current horizontal orbit angle (lazily follows playerFacing)
  const playerFacingRef = useRef(0);
  const cameraAngleRef = useRef({ theta: Math.PI, phi: Math.PI / 3 });

  useFrame((_, delta) => {
    if (!ref.current || !meshRef.current) return;

    const {
      moveForward,
      moveBackward,
      strafeLeft,
      strafeRight,
      rotateLeft,
      rotateRight,
      camUp,
      camDown,
    } = get();

    // --- Vertical camera orbit ---
    const playerPos = ref.current.translation();
    const floorY = 0.5;
    const ratio = (floorY - playerPos.y) / cameraRadius;
    const phiMax =
      ratio >= 1 ? 0.1 : ratio <= -1 ? Math.PI - 0.1 : Math.acos(ratio);

    if (camUp) cameraAngleRef.current.phi -= camRotateSpeed * delta;
    if (camDown) cameraAngleRef.current.phi += camRotateSpeed * delta;
    cameraAngleRef.current.phi = Math.max(
      0.1,
      Math.min(Math.min(phiMax, Math.PI - 0.1), cameraAngleRef.current.phi),
    );

    // --- Player rotation ---
    if (rotateLeft) playerFacingRef.current += rotateSpeed * delta;
    if (rotateRight) playerFacingRef.current -= rotateSpeed * delta;

    // Apply mesh rotation
    meshRef.current.rotation.y = playerFacingRef.current;

    // --- Derive movement vectors from player facing (not camera) ---
    const facing = playerFacingRef.current;
    const playerForward = new THREE.Vector3(
      Math.sin(facing),
      0,
      Math.cos(facing),
    );
    const playerRight = new THREE.Vector3(
      Math.cos(facing),
      0,
      -Math.sin(facing),
    );

    const moveDir = new THREE.Vector3();
    if (moveForward) moveDir.add(playerForward);
    if (moveBackward) moveDir.sub(playerForward);
    if (strafeRight) moveDir.sub(playerRight);
    if (strafeLeft) moveDir.add(playerRight);

    if (moveDir.length() > 0) {
      moveDir.normalize();
      const current = ref.current.translation();
      ref.current.setTranslation(
        {
          x: current.x + moveDir.x * speed * delta,
          y: current.y,
          z: current.z + moveDir.z * speed * delta,
        },
        true,
      );
    }

    // --- Camera lazy-follows player facing ---
    // Target is directly behind the player: facing + PI
    const targetTheta = playerFacingRef.current + Math.PI;
    const current = cameraAngleRef.current.theta;
    const diff =
      ((targetTheta - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    cameraAngleRef.current.theta += diff * 5 * delta; // 5 = follow speed, tune to taste

    // --- Update camera position ---
    const { theta, phi } = cameraAngleRef.current;

    camera.position.set(
      playerPos.x + cameraRadius * Math.sin(phi) * Math.sin(theta),
      playerPos.y + cameraRadius * Math.cos(phi),
      playerPos.z + cameraRadius * Math.sin(phi) * Math.cos(theta),
    );

    camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
  });

  return (
    <RigidBody ref={ref} ccd={true} colliders={false} lockRotations>
      <CuboidCollider
        args={[0.4, 0.9, 0.4]}
        position={[0, 0.9, 0]}
        restitution={0}
        friction={1}
      />
      <group ref={meshRef}>
        <MainCharacter />
      </group>
    </RigidBody>
  );
}
