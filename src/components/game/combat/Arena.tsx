import { useEffect } from "react";
import Combatant from "./Combatant";
import { type Enemy } from "./types";

interface ArenaProps {
  enemies: Enemy[];
  background: string;
  selectedView: "PLAYER" | "ENEMY" | "CHAT";
}

export default function Arena({
  enemies,
  background,
  selectedView,
}: ArenaProps) {

  return (
    <div
      className={`col-span-4 row-span-4 border-2
        ${selectedView === "ENEMY" ? "border-red-400" : "border-white"} 
        rounded-xs w-full flex flex-wrap items-center justify-center gap-4`}
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {enemies.map((enemy) => (
        <Combatant key={enemy.id} combatant={enemy} />
      ))}
    </div>
  );
}
