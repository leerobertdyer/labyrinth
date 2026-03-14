import type Rapier from "@dimforge/rapier3d-compat";
import type { RigidBody as RapierRigidBody } from "@dimforge/rapier3d-compat";
import type { RefObject } from "react";
import * as THREE from "three";
import {
  GROUND_RAY_LENGTH,
  GROUND_RAY_ORIGIN_OFFSET,
  JUMP_STRENGTH,
  playerCamRadius,
  playerCamRotateSpeed,
  playerRotateSpeed,
  playerSpeed,
} from "@/app/constants";

export type MovementKeys = {
  moveForward: boolean;
  moveBackward: boolean;
  strafeLeft: boolean;
  strafeRight: boolean;
  rotateLeft: boolean;
  rotateRight: boolean;
  camUp: boolean;
  camDown: boolean;
  jump: boolean;
}

export type MovementContext = {
  body: RapierRigidBody;
  mesh: THREE.Group;
  keys: MovementKeys;
  world: Rapier.World;
  rapier: typeof Rapier;
  camera: THREE.Camera;
  playerFacingRef: RefObject<number>;
  cameraAngleRef: RefObject<{ theta: number; phi: number }>;
  delta: number;
}

/**
 * One frame of player movement: camera orbit, rotation, horizontal velocity,
 * ground check + jump, and camera follow/position.
 */
export function updateMovement(ctx: MovementContext): void {
  const {
    body,
    mesh,
    keys: {
      moveForward,
      moveBackward,
      strafeLeft,
      strafeRight,
      rotateLeft,
      rotateRight,
      camUp,
      camDown,
      jump,
    },
    world,
    rapier,
    camera,
    playerFacingRef,
    cameraAngleRef,
    delta,
  } = ctx;

  const playerPos = body.translation();

  // --- Vertical camera orbit ---
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

  mesh.rotation.y = playerFacingRef.current;

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
  const currentLinvel = body.linvel();
  if (moveDir.length() > 0) {
    moveDir.normalize();
    body.setLinvel(
      {
        x: moveDir.x * playerSpeed,
        y: currentLinvel.y,
        z: moveDir.z * playerSpeed,
      },
      true,
    );
  } else {
    body.setLinvel({ x: 0, y: currentLinvel.y, z: 0 }, true);
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
    body.collider(0),
    body,
  );
  const isGrounded = rayHit !== null;

  if (jump && isGrounded) {
    const vel = body.linvel();
    body.setLinvel({ x: vel.x, y: JUMP_STRENGTH, z: vel.z }, true);
  }

  // --- Camera lazy-follows player facing ---
  const targetTheta = playerFacingRef.current + Math.PI;
  const current = cameraAngleRef.current.theta;
  const diff =
    ((targetTheta - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  cameraAngleRef.current.theta += diff * 5 * delta;

  // --- Update camera position ---
  const { theta, phi } = cameraAngleRef.current;

  camera.position.set(
    playerPos.x + playerCamRadius * Math.sin(phi) * Math.sin(theta),
    playerPos.y + playerCamRadius * Math.cos(phi),
    playerPos.z + playerCamRadius * Math.sin(phi) * Math.cos(theta),
  );

  camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
}
