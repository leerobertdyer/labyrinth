import { useEffect } from "react";
import Combatant from "./Combatant";
import { type Enemy } from "./types";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { useSelector } from "@xstate/react";

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

  const [state] = useGameMachine();
  const actor = state.children.combatActor;
  if (!actor) return null;

  const selectedEnemyId = useSelector(actor, (snapshot) => snapshot.context.selectedEnemyId);

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
        <Combatant key={enemy.id} combatant={enemy} isSelected={selectedEnemyId === enemy.id} />
      ))}
    </div>
  );
}
