import { useGameMachine } from "@/contexts/GameMachineContext";
import Arena from "./Arena";
import PlayerMenu from "./PlayerMenu";
import { useEffect, useState } from "react";
import EnemyChat from "./EnemyChat";

export default function CombatView() {
  const [state] = useGameMachine();
  const [selectedView, setSelectedView] = useState<"PLAYER" | "ENEMY" | "CHAT">(
    "PLAYER",
  );


  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (selectedView === "CHAT") return;
      const key = event.key.toUpperCase();
      switch (key) {
        case "A":
          if (selectedView === "PLAYER") setSelectedView("ENEMY");
          break;
        case "D":
          if (selectedView === "ENEMY") setSelectedView("PLAYER");
          break;
        case "Escape":
          setSelectedView("PLAYER");
          break;
      }
      console.log("Key pressed:", event.key);
    });
  }, []);

  return (
    <div className="absolute inset-0 bg-black/75 z-1000 flex flex-col items-center justify-center h-screen">
      <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full">
        <Arena
          background="/backgrounds/dungeon.png"
          enemies={state.context.enemies}
          selectedView={selectedView}
        />

        <PlayerMenu />

        <EnemyChat selectedView={selectedView} />
      </div>
    </div>
  );
}
