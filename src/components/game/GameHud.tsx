import { useGameMachine } from "@/contexts/GameMachineContext";
import { useDebugStore } from "@/stores/useDebugStore";
import { useEffect, useState } from "react";

const HIT_FLASH_DURATION_MS = 250;

export default function GameHUD() {
  const [state, send, actor] = useGameMachine();
  const [showHitFlash, setShowHitFlash] = useState(false);
  const { playerPos } = useDebugStore();

  useEffect(() => {
    const subscription = actor.on("SEE_RED", () => {
      setShowHitFlash(true);
      setTimeout(() => setShowHitFlash(false), 100);
    });
    return () => subscription.unsubscribe();
  }, [actor]);

  useEffect(() => {
    if (!showHitFlash) return;
    const t = setTimeout(() => setShowHitFlash(false), HIT_FLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [showHitFlash]);

  return (
    <>
      {showHitFlash && (
        <div className="animate-hit-flash absolute inset-0 bg-red-500 bg-opacity-50 pointer-events-none z-999" />
      )}
      {state.matches({ playing: "paused" }) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
            onClick={() => send({ type: "UNPAUSE" })}
          >
            Resume Game
          </button>
        </div>
      )}

      <div className="absolute top-5 left-10 text-white bg-black/50 p-2 rounded-md z-100">
        HP: {state.context.player.health}
      </div>

      <div className="absolute top-5 right-10 text-white bg-black/50 rounded-md z-100 w-fit flex gap-4 items-start p-3">
        <p className="flex justify-between w-full gap-1"><span>x</span> {playerPos.x}</p>
        <p className="flex justify-between w-full gap-1"><span>y</span> {playerPos.y}</p>
        <p className="flex justify-between w-full gap-1"><span>z</span> {playerPos.z}</p>
      </div>
    </>
  );
}
