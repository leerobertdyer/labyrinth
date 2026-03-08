"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import {
  GameMachineProvider,
} from "@/contexts/GameMachineContext";
import Scene from "./Scene";
import { controls } from "./constants";
import GameHUD from "@/components/game/GameHud";


export default function GamePage() {
  return (
    <GameMachineProvider>
      <KeyboardControls map={controls}>
        <GameHUD />
        <Canvas
          style={{ width: "100vw", height: "100vh", backgroundColor: "black" }}
          camera={{ position: [0, 5, 10], fov: 60 }}
        >
          <Scene />
        </Canvas>
      </KeyboardControls>
    </GameMachineProvider>
  );
}
