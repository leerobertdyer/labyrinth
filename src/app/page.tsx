"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import Scene from "./Scene";

const controls = [
  { name: "forward", keys: ["ArrowUp"] },
  { name: "backward", keys: ["ArrowDown"] },
  { name: "left", keys: ["ArrowLeft"] },
  { name: "right", keys: ["ArrowRight"] },
  { name: "rotateLeft", keys: [ "a", "A"]},
  { name: "rotateRight", keys: [ "d", "D"]},
  { name: "rotateUp", keys: [ "w", "W"]},
  { name: "rotateDown", keys: [ "s", "S"]},
];

export default function GamePage() {
  return (
    <KeyboardControls map={controls}>
      <Canvas
        style={{ width: "100vw", height: "100vh", backgroundColor: "black"}}
        camera={{ position: [0, 5, 10], fov: 60 }}
      >
          <Scene />
      </Canvas>
    </KeyboardControls>
  );
}
