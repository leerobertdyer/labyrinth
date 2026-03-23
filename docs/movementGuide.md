# Labyrinth Movement System Guide

A reference for understanding, tweaking, and extending `updateMovement`.

---

## Spherical Coordinates — The Core Camera Model

The camera uses **spherical coordinates** rather than a raw position. Instead of saying "put the camera at (x, y, z)", you say "put it at radius `r`, vertical angle `phi`, horizontal angle `theta` from the player." Each frame you convert back to Cartesian:

```
x = playerPos.x + r * sin(phi) * sin(theta)
y = playerPos.y + r * cos(phi)
z = playerPos.z + r * sin(phi) * cos(theta)
```

- **`playerCamRadius` (r)** — orbit distance from the player. Decrease to move the camera in, increase to pull it out.
- **`phi`** — vertical angle. `0` = directly above, `Math.PI/2` = eye level, `Math.PI` = directly below. Clamped between `0.1` and `Math.PI - 0.1` to prevent flipping.
- **`theta`** — horizontal angle. Lazily tracks `playerFacingRef + Math.PI` (the `+ Math.PI` puts the camera *behind* the player — opposite side of the orbit).

This model makes it easy to orbit without gimbal lock and without manually computing 3D offsets.

---

## Camera Lazy-Follow Math

```ts
const targetTheta = playerFacingRef.current + Math.PI;
const diff = ((targetTheta - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
cameraAngleRef.current.theta += diff * 5 * delta;
```

- `targetTheta` — where theta *wants* to be (behind the player).
- The modulo expression normalizes the angular difference to `[-π, π]` so the camera always takes the *short way around* when the player turns past 0/2π.
- `diff * 5 * delta` is a frame-rate-independent lerp. The `5` controls snappiness — higher = camera snaps faster, lower = more lag. A value of `0` would freeze the camera, infinity would be instant.

**To tweak:** change `5` in `diff * 5 * delta`. Or decouple it entirely and drive theta directly from mouse input (see First Person below).

---

## phi Clamp — Current Floor-Based Approach

```ts
const ratio = (floorY - playerPos.y) / playerCamRadius;
const phiMax = ratio >= 1 ? 0.1 : ratio <= -1 ? Math.PI : Math.acos(ratio);
```

This dynamically tightens the maximum downward angle based on the player's height above `floorY = 0.5`. The idea: as the player descends toward the floor, the camera can't look further down than the angle that would clip through it.

`acos(ratio)` computes the exact phi that would point the camera at floor level — so `phiMax` becomes "the angle that just grazes the floor." When `ratio >= 1` (player is at or below floor), it clamps hard to `0.1` (near-overhead). When `ratio <= -1` (player is very high), it allows all the way to `Math.PI`.

**The limitation:** this only accounts for a flat floor at a fixed Y. It ignores walls, ceilings, and geometry above the player. See the 3D Spring Arm section below.

---

## Alternative: First-Person Mode

Drop the orbit radius to zero and drive `phi`/`theta` directly from mouse deltas instead of lazy-following the player. The camera becomes the player's eyes.

```ts
// In your input handler, accumulate mouse movement:
cameraAngleRef.current.theta -= mouseDeltaX * sensitivity;
cameraAngleRef.current.phi   -= mouseDeltaY * sensitivity;

// Lock the cursor:
canvas.requestPointerLock();
```

```ts
// In updateMovement, replace the lazy-follow block with:
// (do nothing — theta/phi are driven by mouse directly)

// Move the camera to the player's head position instead of orbiting:
const headOffset = 1.7; // approx eye height
camera.position.set(playerPos.x, playerPos.y + headOffset, playerPos.z);

// Derive a lookAt target from spherical angles:
camera.lookAt(
  playerPos.x + Math.sin(phi) * Math.sin(theta),
  playerPos.y + headOffset + Math.cos(phi),
  playerPos.z + Math.sin(phi) * Math.cos(theta),
);
```

You'd also want to derive `playerFacingRef` from `theta` in this mode so WASD still moves relative to where you're looking:

```ts
playerFacingRef.current = theta; // camera heading IS player heading in FP
```

Clip pointerlock to the canvas and handle `pointerlockchange` to pause input when focus is lost.

---

## Future: 3D Spring Arm (Wall/Ceiling Avoidance)

The current phi clamp is a 2D approximation. A proper **spring arm** replaces it with a raycast or sphere cast from the player *toward* the camera's desired position. If it hits geometry, the camera is pulled in to the hit point.

```ts
// Pseudocode — replace the fixed playerCamRadius with a dynamic one each frame:

const desiredCamPos = new THREE.Vector3(
  playerPos.x + playerCamRadius * Math.sin(phi) * Math.sin(theta),
  playerPos.y + playerCamRadius * Math.cos(phi),
  playerPos.z + playerCamRadius * Math.sin(phi) * Math.cos(theta),
);

const dirToCamera = desiredCamPos.clone().sub(playerPos).normalize();
const springRay = new rapier.Ray(playerPos, dirToCamera);
const hit = world.castRay(springRay, playerCamRadius, true, ...excludePlayer);

const effectiveRadius = hit ? hit.toi * 0.9 : playerCamRadius;
// Use effectiveRadius instead of playerCamRadius in camera.position.set(...)
```

`toi` is Rapier's "time of impact" — for a unit-direction ray, it's the distance to the hit. Multiplying by `0.9` pulls the camera slightly in front of the wall so it doesn't clip.

This completely replaces the floor-based phi clamp. You can remove the `floorY`/`phiMax` logic and let phi roam freely (`0.1` to `Math.PI - 0.1`), trusting the spring arm to handle any geometry — floors, ceilings, pillars, dungeon walls.

A sphere cast (`castShape` with a small ball) is more robust than a ray cast because it accounts for camera width, but a ray is a fine starting point.

---

## Quick Reference: Knobs to Turn

| What you want | What to change |
|---|---|
| Camera closer/further | `playerCamRadius` in constants |
| Camera snappier/lazier | The `5` in `diff * 5 * delta` |
| Camera higher overhead by default | Decrease initial `phi` (closer to 0) |
| Camera more at eye level by default | Increase initial `phi` (closer to π/2) |
| Mouse sensitivity (FP mode) | `sensitivity` multiplier on mouse deltas |
| Jump height | `JUMP_STRENGTH` in constants |
| Player turn speed | `playerRotateSpeed` in constants |
| Vertical camera orbit speed | `playerCamRotateSpeed` in constants |
