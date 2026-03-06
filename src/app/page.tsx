"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import Scene from "./Scene";

const controls = [
  { name: "moveForward", keys: ["w", "W"] },
  { name: "moveBackward", keys: ["s", "S"] },
  { name: "strafeLeft", keys: ["a", "A"] },
  { name: "strafeRight", keys: ["d", "D"] },
  { name: "rotateLeft", keys: ["ArrowLeft"] },
  { name: "rotateRight", keys: ["ArrowRight"] },
  { name: "camUp", keys: ["ArrowUp"] },
  { name: "camDown", keys: ["ArrowDown"] },
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
