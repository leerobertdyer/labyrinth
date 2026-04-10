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
};

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
  cameraRadiusRef: RefObject<number | null>;
};

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
    cameraRadiusRef,
  } = ctx;

  const EXCLUDE_SENSORS = rapier.QueryFilterFlags.EXCLUDE_SENSORS;

  if (cameraRadiusRef.current === null) {
    cameraRadiusRef.current = 0;
  }

  const playerPos = body.translation();

  // --- Vertical camera orbit ---
  const phiMax = 1.4;

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
  const playerRight = new THREE.Vector3(Math.cos(facing), 0, -Math.sin(facing));

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
    EXCLUDE_SENSORS,
    undefined,
    body.collider(0),
    body,
  );
  const isGrounded = rayHit !== null;

  if (jump && isGrounded) {
    const vel = body.linvel();
    // Zero out any existing Y velocity first so the impulse is consistent
    body.setLinvel({ x: vel.x, y: 0, z: vel.z }, true);
    body.applyImpulse({ x: 0, y: JUMP_STRENGTH * body.mass(), z: 0 }, true);
  }

  // Apply extra gravity on descent
  if (currentLinvel.y < 0) {
    body.applyImpulse({ x: 0, y: -30 * delta, z: 0 }, true);
  }

  // Optional: also cut the jump short if they release jump early
  if (currentLinvel.y > 0 && !jump) {
    body.applyImpulse({ x: 0, y: -15 * delta, z: 0 }, true);
  }

  // --- Camera lazy-follows player facing ---
  const targetTheta = playerFacingRef.current + Math.PI;
  const current = cameraAngleRef.current.theta;
  const diff =
    ((targetTheta - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  cameraAngleRef.current.theta += diff * 5 * delta;

  // --- Update camera position ---
  const {
    theta, // longitude (horizontal rotation)
    phi, // latitude (vertical angle from top)
  } = cameraAngleRef.current;

  const horizontalDist = Math.sin(phi); // XZ component magnitude
  const verticalDist = Math.cos(phi / 4); // Y component

  const dirToCamera = new THREE.Vector3(
    horizontalDist * Math.sin(theta),
    verticalDist,
    horizontalDist * Math.cos(theta),
  ).normalize();

  const SPHERE_RADIUS = 0.25;
  const sphere = new rapier.Ball(SPHERE_RADIUS);

  // Pull origin back by sphere radius so it doesn't start clipping the player capsule
  const castOrigin = {
    x: playerPos.x + dirToCamera.x * SPHERE_RADIUS,
    y: playerPos.y + 1 + dirToCamera.y * SPHERE_RADIUS,
    z: playerPos.z + dirToCamera.z * SPHERE_RADIUS,
  };

  const hit = world.castShape(
    castOrigin,
    { w: 1, x: 0, y: 0, z: 0 },
    { x: dirToCamera.x, y: dirToCamera.y, z: dirToCamera.z },
    sphere,
    0, // targetDistance: register hits on contact
    playerCamRadius, // maxToi: sweep this far
    true,
    EXCLUDE_SENSORS, // Allow invisible events like TriggerEvents.tsx to pass through camera
    undefined,
    undefined,
    body,
  );

  const targetRadius =
    hit !== null ? Math.max(0.8, hit.time_of_impact * 0.85) : playerCamRadius;

  const lerpSpeed = targetRadius < cameraRadiusRef.current ? 25 : 8;
  cameraRadiusRef.current = THREE.MathUtils.lerp(
    cameraRadiusRef.current,
    targetRadius,
    lerpSpeed * delta,
  );

  const r = cameraRadiusRef.current;

  // Always keep camera at least this far above player origin
  const MIN_CAM_HEIGHT = 1.5;
  const preferredY = playerPos.y + playerCamRadius * Math.cos(phi);
  const camY = Math.max(playerPos.y + MIN_CAM_HEIGHT, preferredY);

  const compressedXZ = r * Math.sin(phi);

  camera.position.set(
    playerPos.x + compressedXZ * Math.sin(theta),
    camY, // not scaled by r — height stays fixed
    playerPos.z + compressedXZ * Math.cos(theta),
  );

  camera.lookAt(playerPos.x, playerPos.y + 2, playerPos.z);
}
