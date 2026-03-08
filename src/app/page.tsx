"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import {
  GameMachineProvider,
  useGameMachine,
} from "@/contexts/GameMachineContext";
import Scene from "./Scene";
import { explorationControls } from "./constants";
import GameHUD from "@/components/game/GameHud";
import CombatView from "@/components/game/combat/CombatView";

function GameContent() {
  const [state] = useGameMachine();
  return (
    <KeyboardControls map={explorationControls}>
      <GameHUD />
      {state.matches({ playing: "inCombat" }) && <CombatView />}
      <Canvas
        style={{ width: "100vw", height: "100vh", backgroundColor: "black" }}
        camera={{ position: [0, 5, 10], fov: 60 }}
      >
        <Scene />
      </Canvas>
    </KeyboardControls>
  );
}

export default function GamePage() {
  return (
    <GameMachineProvider>
      <GameContent />
    </GameMachineProvider>
  );
}
