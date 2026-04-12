"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMachine } from "@xstate/react";
import { gameMachine } from "@/machines/gameMachine/gameMachine";
import { startingPlayer } from "@/app/constants";

const GameMachineContext = createContext<ReturnType<
  typeof useMachine<typeof gameMachine>
> | null>(null);

export function GameMachineProvider({ children }: { children: ReactNode }) {
  // TODO: instead of default load player values from save in db
  const value = useMachine(gameMachine, { input: { player: startingPlayer } });
  return (
    <GameMachineContext.Provider value={value}>
      {children}
    </GameMachineContext.Provider>
  );
}

export function useGameMachine() {
  const value = useContext(GameMachineContext);
  if (value == null) {
    throw new Error("useGameMachine must be used within GameMachineProvider");
  }
  return value;
}
