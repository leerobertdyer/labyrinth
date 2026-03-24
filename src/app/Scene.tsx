import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import Player from "@/components/game/characters/Player/Player";
import RoomManager from "@/components/game/Rooms/RoomManager";

export default function Scene() {

  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const orbitRef = useRef<OrbitControlsImpl>(null);

  useFrame(() => {
    if (orbitRef.current) {
      orbitRef.current.target.copy(playerPos.current);
      orbitRef.current.update();
    }
  });

  return (
    <Physics gravity={[0, -10, 0]} debug={false}>
      {/* <axesHelper scale={13} position={[0, 1, 0]} />  */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Player />
      <RoomManager />
    </Physics>
  );
}
