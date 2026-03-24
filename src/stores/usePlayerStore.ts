import { RapierRigidBody } from "@react-three/rapier";
import { RefObject, createRef } from "react";
import { Vector3 } from "three";
import { create } from "zustand";

interface PlayerStore {
  ref: RefObject<RapierRigidBody | null>;
  teleportPlayer: (spawnPoint: Vector3) => void;
}

const ref = createRef<RapierRigidBody>();

export const usePlayerStore = create<PlayerStore>(() => ({
  ref,
  teleportPlayer: (spawnPoint) => {
    ref.current?.setTranslation(spawnPoint, true);
  },
}));