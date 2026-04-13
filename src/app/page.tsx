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
import StartScreen from "@/components/game/Views/StartScreen";
import DeathScreen from "@/components/game/Views/DeathScreen";
import StatSelection from "@/components/game/Views/StatSelection";

function GameContent() {
  const [state] = useGameMachine();
  if (state.matches({ startScreen: "idle" })) return <StartScreen />;
  if (state.matches({ startScreen: "statSelection" }) || state.matches({ playing: "levelUp"})) return <StatSelection p={state.context.player}/>;

  return (
    <KeyboardControls map={explorationControls}>
      <GameHUD />
      {state.matches({ playing: "inCombat" }) && <CombatView />}
      {state.matches({ playing: "dead" }) && (
        <DeathScreen room={state.context.room} />
      )}
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
