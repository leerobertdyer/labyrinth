import { create } from "zustand";

interface RoomStore {
  currentRoomId: string;
  transitionTo: (roomId: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  currentRoomId: "startingRoom",
  transitionTo: (roomId) => set({ currentRoomId: roomId }),
}));
