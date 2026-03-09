import { useGameMachine } from "@/contexts/GameMachineContext";
import Arena from "./Arena";
import PlayerMenu from "./PlayerMenu";
import EnemyChat from "./EnemyChat";
import { useSelector } from "@xstate/react";
import { CombatViews } from "./types";

export default function CombatView() {
  const [state] = useGameMachine();
  const actor = state.children.combatActor;

  if (!actor) return null;

  return <CombatViewContent state={state} actor={actor} />;
}

function CombatViewContent({
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
  const enemies = useSelector(actor, (snapshot) => snapshot.context.enemies);

  return (
    <div className="absolute inset-0 bg-black/75 z-100 flex flex-col items-center justify-center h-screen">
      <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full">
        <Arena
          background="/backgrounds/dungeon.png"
          enemies={enemies}
          selectedView={selectedView}
          isPlayerTurn={playerTurn}
        />

        <PlayerMenu isPlayersTurn={playerTurn} selectedView={selectedView} />

        <EnemyChat selectedView={selectedView} />
      </div>
    </div>
  );
}
