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
import DialogueView from "@/components/game/Views/DialogueView";
import { useRef } from "react";

function GameContent() {
  const [state, send] = useGameMachine();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handleStart() {
    audioRef.current = new Audio("/audio/gameLoop.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = .05;
    audioRef.current.play();
    send({ type: "NEW_GAME" });
  }

  if (state.matches({ startScreen: "idle" })) return <StartScreen handleStart={handleStart} />;
  if (
    state.matches({ startScreen: "statSelection" }) ||
    state.matches({ playing: "levelUp" })
  )
    return <StatSelection p={state.context.player} />;

  return (
    <KeyboardControls map={explorationControls}>
      {state.matches({ playing: "talking" }) && (
        <DialogueView conversation={state.context.conversation} />
      )}
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
