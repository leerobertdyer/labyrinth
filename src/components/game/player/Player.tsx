import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useRef } from "react";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function Player() {
  const ref = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();
  const speed = 5;
  // Camera offset — how far behind and above the player
  const cameraOffset = new THREE.Vector3(0, 4, 8);

  useFrame((state, delta) => {
    const { forward, backward, left, right } = get();
    if (!ref.current) return;

    // Get camera's forward and right vectors projected onto XZ plane
    const cameraForward = new THREE.Vector3();
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0));
    cameraRight.normalize();

    const moveDir = new THREE.Vector3();
    if (forward) moveDir.add(cameraForward);
    if (backward) moveDir.sub(cameraForward);
    if (right) moveDir.add(cameraRight);
    if (left) moveDir.sub(cameraRight);
    moveDir.normalize();

    const current = ref.current.translation();
    ref.current.setTranslation(
      {
        x: current.x + moveDir.x * speed * delta,
        y: current.y,
        z: current.z + moveDir.z * speed * delta,
      },
      true
    );
     // Follow camera
     const playerPos = ref.current.translation()
     const targetCameraPos = new THREE.Vector3(
       playerPos.x + cameraOffset.x,
       playerPos.y + cameraOffset.y,
       playerPos.z + cameraOffset.z
     )
      // Lerp for smooth follow instead of snapping
    camera.position.lerp(targetCameraPos, 0.1)
    camera.lookAt(playerPos.x, playerPos.y, playerPos.z)
    
  });

  return (
    <RigidBody ref={ref} colliders="cuboid" lockRotations>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="royalblue" />
      </mesh>
    </RigidBody>
  );
}
