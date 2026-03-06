import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useRef } from "react";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MainCharacter } from "@/components/game/models/mixamo/mainCharacter";

export default function Player() {
  const ref = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();
  const speed = 5;

  const cameraAngleRef = useRef({ theta: Math.PI, phi: Math.PI / 3 })
  const cameraRadius = 8;

  useFrame((state, delta) => {
    const { forward, backward, left, right, rotateLeft, rotateRight, rotateUp, rotateDown } = get()
    if (!ref.current) return
  
    // Camera rotation
    const rotateSpeed = 1.5
    if (rotateLeft) cameraAngleRef.current.theta -= rotateSpeed * delta
    if (rotateRight) cameraAngleRef.current.theta += rotateSpeed * delta
    if (rotateUp) cameraAngleRef.current.phi -= rotateSpeed * delta
    if (rotateDown) cameraAngleRef.current.phi += rotateSpeed * delta
  
    cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngleRef.current.phi))
  
    // Player movement — still camera relative
    const cameraForward = new THREE.Vector3()
    camera.getWorldDirection(cameraForward)
    cameraForward.y = 0
    cameraForward.normalize()
  
    const cameraRight = new THREE.Vector3()
    cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0))
    cameraRight.normalize()
  
    const moveDir = new THREE.Vector3()
    if (forward) moveDir.add(cameraForward)
    if (backward) moveDir.sub(cameraForward)
    if (right) moveDir.add(cameraRight)
    if (left) moveDir.sub(cameraRight)
  
    if (moveDir.length() > 0) {
      moveDir.normalize()
      const current = ref.current.translation()
      ref.current.setTranslation({
        x: current.x + moveDir.x * speed * delta,
        y: current.y,
        z: current.z + moveDir.z * speed * delta
      }, true)
    }
  
    // Update camera position on sphere
    const { theta, phi } = cameraAngleRef.current
    const playerPos = ref.current.translation()
  
    camera.position.set(
      playerPos.x + cameraRadius * Math.sin(phi) * Math.sin(theta),
      playerPos.y + cameraRadius * Math.cos(phi),
      playerPos.z + cameraRadius * Math.sin(phi) * Math.cos(theta)
    )
  
    camera.lookAt(playerPos.x, playerPos.y, playerPos.z)
  })

  return (
    <RigidBody ref={ref} colliders="cuboid" lockRotations>
      <MainCharacter />
    </RigidBody>
  );
}
