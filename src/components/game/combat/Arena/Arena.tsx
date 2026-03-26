import Combatant from "./Combatant";
import { type Enemy } from "../types";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { useSelector } from "@xstate/react";
import { useEffect } from "react";
import { eventKeyToControl } from "../combatControls";

type ArenaProps = {
  enemies: Enemy[];
  background: string;
  selectedView: "PLAYER" | "ENEMY" | "CHAT";
  isPlayerTurn: boolean;
}

export default function Arena({
  enemies,
  background,
  selectedView,
  isPlayerTurn,
}: ArenaProps) {
  const [state] = useGameMachine();
  const actor = state.children.combatActor;
  const isArenaView = selectedView === "ENEMY"

  const selectedEnemyId = useSelector(actor, (snapshot) => snapshot?.context.selectedEnemyId ?? null);

  useEffect(() => {
    if (selectedView !== "ENEMY" || !actor) return;
    const handler = (event: KeyboardEvent) => {
      const action = eventKeyToControl(event);
      if (!action) return;
      const ctx = actor.getSnapshot().context;
      const alive = ctx.enemies.filter((e) => e.health > 0);
      if (alive.length === 0) return;

      const currentIndex = ctx.selectedEnemyId
        ? alive.findIndex((e) => e.id === ctx.selectedEnemyId)
        : -1;
      const index = currentIndex < 0 ? 0 : currentIndex;

      switch (action) {
        case "MENU_LEFT": {
          const prev = Math.max(0, index - 1);
          actor.send({ type: "SELECT_ENEMY", enemyId: alive[prev].id });
          break;
        }
        case "MENU_RIGHT": {
          const next = Math.min(alive.length - 1, index + 1);
          actor.send({ type: "SELECT_ENEMY", enemyId: alive[next].id });
          break;
        }
        case "SELECT":
          if (isPlayerTurn) actor.send({ type: "ATTACK" });
          break;
        case "BACK":
          actor.send({ type: "SET_VIEW", view: "PLAYER" });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedView, isPlayerTurn, actor]);

  if (!actor) return null;

  function showSelected(id: string){
    return selectedEnemyId === id && isPlayerTurn && isArenaView
  }

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
        
        <Combatant key={enemy.id} combatant={enemy} isSelected={showSelected(enemy.id)} />
      ))}
    </div>
  );
}
