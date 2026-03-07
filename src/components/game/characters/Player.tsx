import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RapierRigidBody, RigidBody, useRapier } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";
import { MainCharacter } from "@/components/game/models/mixamo/mainCharacter";
import { GROUND_RAY_LENGTH, GROUND_RAY_ORIGIN_OFFSET, JUMP_STRENGTH, playerCamRadius, playerCamRotateSpeed, playerRotateSpeed, playerSpeed } from "@/app/constants";

export default function Player() {
  const ref = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();
  const { world, rapier } = useRapier();

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
      jump,
    } = get();


    // --- Vertical camera orbit ---
    const playerPos = ref.current.translation();
    const floorY = 0.5;
    const ratio = (floorY - playerPos.y) / playerCamRadius;
    const phiMax =
      ratio >= 1 ? 0.1 : ratio <= -1 ? Math.PI - 0.1 : Math.acos(ratio);

    if (camUp) cameraAngleRef.current.phi -= playerCamRotateSpeed * delta;
    if (camDown) cameraAngleRef.current.phi += playerCamRotateSpeed * delta;
    cameraAngleRef.current.phi = Math.max(
      0.1,
      Math.min(Math.min(phiMax, Math.PI - 0.1), cameraAngleRef.current.phi),
    );

    // --- Player rotation ---
    if (rotateLeft) playerFacingRef.current += playerRotateSpeed * delta;
    if (rotateRight) playerFacingRef.current -= playerRotateSpeed * delta;

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

    // Velocity-based movement so the player has real momentum (e.g. can push enemies)
    const currentLinvel = ref.current.linvel();
    // console.log(currentLinvel);
    if (moveDir.length() > 0) {
      moveDir.normalize();
      ref.current.setLinvel(
        {
          x: moveDir.x * playerSpeed,
          y: currentLinvel.y,
          z: moveDir.z * playerSpeed,
        },
        true,
      );
    } else {
      ref.current.setLinvel(
        { x: 0, y: currentLinvel.y, z: 0 },
        true,
      );
    }

    // Jump: only when grounded (raycast down from feet)
    const rayOrigin = {
      x: playerPos.x,
      y: playerPos.y + GROUND_RAY_ORIGIN_OFFSET,
      z: playerPos.z,
    };
    const rayDir = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const rayHit = world.castRay(
      ray,
      GROUND_RAY_LENGTH,
      true,
      undefined,
      undefined,
      ref.current.collider(0),
      ref.current,
    );
    const isGrounded = rayHit !== null;

    if (jump && isGrounded) {

      const vel = ref.current.linvel();
      ref.current.setLinvel(
        { x: vel.x, y: JUMP_STRENGTH, z: vel.z },
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
      playerPos.x + playerCamRadius * Math.sin(phi) * Math.sin(theta),
      playerPos.y + playerCamRadius * Math.cos(phi),
      playerPos.z + playerCamRadius * Math.sin(phi) * Math.cos(theta),
    );

    camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
  });

  return (
    <RigidBody ref={ref} ccd={true} colliders={false} lockRotations friction={2} mass={10}>
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
