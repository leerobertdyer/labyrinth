"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMachine } from "@xstate/react";
import { gameMachine } from "@/machines/gameMachine";

const GameMachineContext = createContext<
  ReturnType<typeof useMachine<typeof gameMachine>> | null
>(null);

export function GameMachineProvider({ children }: { children: ReactNode }) {
  const value = useMachine(gameMachine);
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
