import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import Player from "@/components/game/characters/Player/Player";
import { Vector3 } from "three";
import Shopkeeper from "@/components/game/characters/Shopkeeper/Shopkeeper";
import RoomManager from "@/components/game/Rooms/RoomManager";

export default function Scene() {
  // const [currentRoomId, setCurrentRoomId] = useState("startingRoom")

  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const orbitRef = useRef<OrbitControlsImpl>(null);

  useFrame(() => {
    if (orbitRef.current) {
      orbitRef.current.target.copy(playerPos.current);
      orbitRef.current.update();
    }
  });

  return (
    <Physics gravity={[0, -10, 0]} debug={true}>
      {/* <axesHelper scale={13} position={[0, 1, 0]} />  */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Player />
      <Shopkeeper
        position={new Vector3(20 / 2 - 3, 0, 0)}
        rotation={[0, (Math.PI / 2.0) * -1, 0]}
        scale={2}
      />
     <RoomManager roomId="startingRoom" />
    </Physics>
  );
}
