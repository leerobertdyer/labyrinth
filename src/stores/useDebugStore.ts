import { create } from "zustand";

interface Ipos {
  x: number;
  y: number;
  z: number;
}

interface IDebugStore {
  playerPos: Ipos;
  setPlayerPos: (pos: Ipos) => void;
}

export const useDebugStore = create<IDebugStore>((set) => ({
  playerPos: { x: 0, y: 0, z: 0 },
  setPlayerPos: (pos) => set({ playerPos: pos }),
}));
