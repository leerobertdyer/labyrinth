import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import Player from "@/components/game/player/Player";
import Room, { WallEdge } from "@/components/game/structure/Room";
import { Barrels } from "@/components/game/models/kenney/retroMedieval/barrels";
import { Vector3 } from "three";

export default function Scene() {
  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const orbitRef = useRef<OrbitControlsImpl>(null);
  const roomSize = 40;
  const wallEdgesSouth: WallEdge = {
    direction: "south",
    slots: Array(roomSize).fill("wall").map((e: string, i: number) => {
      switch(i) {
        case 18:return "gateLeft"
        case 19: return "gateTop"
        case 20: return "gateTop"
        case 21: return "gateRight"
        default: return "wall"
      }
    })
  };
  const wallEdgesNorth: WallEdge = {
    direction: "north",
    slots: Array(roomSize).fill("wall"),
  };
  const wallEdgesEast: WallEdge = {
    direction: "east",
    slots: Array(roomSize).fill("wall"),
  };
  const wallEdgesWest: WallEdge = {
    direction: "west",
    slots: Array(roomSize).fill("wall"),
  };

  useFrame(() => {
    if (orbitRef.current) {
      orbitRef.current.target.copy(playerPos.current);
      orbitRef.current.update();
    }
  });
  const barrel1 = { pos: new Vector3(roomSize / 2 - 1, .1, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0), scale: new Vector3(4, 4, 4), Model: Barrels }
  const barrel2= { ...barrel1, pos: new Vector3(roomSize/2-1, .1, 3)}
  const barrel3= { ...barrel1, pos: new Vector3(roomSize/2-1, .1, 6)}
  const barrel4= { ...barrel1, pos: new Vector3(roomSize/2-1, .1, -3)}
  const barrels = [barrel1, barrel2, barrel3, barrel4]
  return (
    <Physics gravity={[0, -1, 0]}>
      <axesHelper scale={13} position={[0, 1, 0]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Player />
      <Room
        size={roomSize}
        tileSize={1}
        edges={[wallEdgesNorth, wallEdgesEast, wallEdgesWest, wallEdgesSouth]}
        debris={barrels}      />
    </Physics>
  );
}
