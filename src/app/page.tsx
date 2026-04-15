"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls, useGLTF } from "@react-three/drei";
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
import SkyBox from "@/components/game/Skybox/Skybox";
import BackgroundMusicLoop from "@/components/game/Audio/BackgroundMusicLoop";
import { Suspense } from "react";

useGLTF.preload("/models/mixamo/lostSoul.glb");
useGLTF.preload("/models/ldyer/Skeleton.glb");
useGLTF.preload("/models/mixamo/mainCharacter.glb");
useGLTF.preload("/models/mixamo/shopkeeper.glb");

function GameContent() {
  const [state, send] = useGameMachine();

  function handleStart() {
    send({ type: "NEW_GAME" });
  }

  const isStart = state.matches({ startScreen: "idle" });
  const isStatSelection =
    state.matches({ startScreen: "statSelection" }) ||
    state.matches({ playing: "levelUp" });
  const isInCombat = state.matches({ playing: "inCombat" });
  const isDead = state.matches({ playing: "dead" });
  const isTalking = state.matches({ playing: "talking" });

  return (
    <KeyboardControls map={explorationControls}>
      <GameHUD />
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{ position: [0, 5, 10], fov: 60 }}
      > 
        <SkyBox />
        <Suspense fallback={null}>
        <BackgroundMusicLoop />
        </Suspense>
        <Scene />
      </Canvas>

      {isTalking && <DialogueView conversation={state.context.conversation} />}
      {isStart && <StartScreen handleStart={handleStart} />}
      {isStatSelection && <StatSelection p={state.context.player} />}
      {isInCombat && <CombatView />}
      {isDead && <DeathScreen room={state.context.room} />}
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
