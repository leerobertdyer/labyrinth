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

  const devMode = process.env.DEV_MODE ? true : false;

  useFrame(() => {
    if (orbitRef.current) {
      orbitRef.current.target.copy(playerPos.current);
      orbitRef.current.update();
    }
  });

  return (
    <Physics gravity={[0, -10, 0]} debug={devMode}>
      {/* <axesHelper scale={13} position={[0, 1, 0]} />  */}
      <ambientLight intensity={0.05} />
      <spotLight position={[0, 14, -4]} intensity={800} rotation={[0, 0, 0]} distance={50} penumbra={0.5}/>
      <Player />
      <RoomManager />
    </Physics>
  );
}
