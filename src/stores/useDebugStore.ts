import { create } from "zustand";

export const useDebugStore = create<{
  playerPos: { x: number; y: number; z: number };
  setPlayerPos: (pos: { x: number; y: number; z: number }) => void;
}>((set) => ({
  playerPos: { x: 0, y: 0, z: 0 },
  setPlayerPos: (pos) => set({ playerPos: pos }),
}));
