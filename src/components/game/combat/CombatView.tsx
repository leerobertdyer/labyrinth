import { useGameMachine } from "@/contexts/GameMachineContext";
import Arena from "./Arena";
import PlayerMenu from "./PlayerMenu";
import { useEffect } from "react";
import EnemyChat from "./EnemyChat";
import { combatControlsHandler, eventKeyToControl } from "./controls";
import { useSelector } from "@xstate/react";
import { CombatViews } from "./types";

export default function CombatView() {
  const [state] = useGameMachine();
  const actor = state.children.combatActor;

  if (!actor) return null;

  return <CombatViewContent state={state} actor={actor} />;
}

function CombatViewContent({
  state,
  actor,
}: {
  state: ReturnType<typeof useGameMachine>[0];
  actor: NonNullable<
    ReturnType<typeof useGameMachine>[0]["children"]["combatActor"]
  >;
}) {
  const playerTurn = useSelector(actor, (snapshot) =>
    snapshot.matches("playerTurn"),
  );
  const selectedView = useSelector(
    actor,
    (snapshot) => (snapshot.context.selectedView ?? "PLAYER") as CombatViews,
  );

  useEffect(() => {
    window.addEventListener("keydown", (event) => combatControlsHandler(event, selectedView));
    return () => window.removeEventListener("keydown", (event) => combatControlsHandler(event, selectedView));
  }, []);

  return (
    <div className="absolute inset-0 bg-black/75 z-1000 flex flex-col items-center justify-center h-screen">
      <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full">
        <Arena
          background="/backgrounds/dungeon.png"
          enemies={state.context.enemies}
          selectedView={selectedView}
        />

        <PlayerMenu isPlayersTurn={playerTurn} />

        <EnemyChat selectedView={selectedView} />
      </div>
    </div>
  );
}
