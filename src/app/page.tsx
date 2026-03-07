"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import Scene from "./Scene";
import { controls } from "./constants";

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
