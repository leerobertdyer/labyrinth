import {  STARTING_ROOM } from "@/components/game/Rooms/constants";
import { create } from "zustand";

interface RoomStore {
  currentRoomId: string;
  transitionTo: (roomId: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  currentRoomId: STARTING_ROOM,
  transitionTo: (roomId) => set({ currentRoomId: roomId }),
}));
