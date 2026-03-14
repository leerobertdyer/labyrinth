import { useGameMachine } from "@/contexts/GameMachineContext";
import Arena from "./Arena";
import PlayerMenu from "./PlayerMenu";
import EnemyChat from "./EnemyChat";
import { useSelector } from "@xstate/react";
import { CombatViews } from "./types";

export default function CombatView() {
  const [state] = useGameMachine();
  const combatActor = state.children.combatActor;

  if (!combatActor) return null;

  return <CombatViewContent state={state} combatActor={combatActor} />;
}

function CombatViewContent({
  combatActor,
}: {
  state: ReturnType<typeof useGameMachine>[0];
  combatActor: NonNullable<
    ReturnType<typeof useGameMachine>[0]["children"]["combatActor"]
  >;
}) {
  const playerTurn = useSelector(combatActor, (snapshot) =>
    snapshot.matches("playerTurn"),
  );
  const selectedView = useSelector(
    combatActor,
    (snapshot) => (snapshot.context.selectedView ?? "PLAYER") as CombatViews,
  );
  const enemies = useSelector(combatActor, (snapshot) => snapshot.context.enemies);

  return (
    <div className="absolute inset-0 bg-black/75 z-100 flex flex-col items-center justify-center h-screen">
      <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full">
        <Arena
          background="/backgrounds/dungeon.png"
          enemies={enemies}
          selectedView={selectedView}
          isPlayerTurn={playerTurn}
        />

        <PlayerMenu isPlayersTurn={playerTurn} selectedView={selectedView} combatActor={combatActor}/>

        <EnemyChat selectedView={selectedView} enemies={enemies} combatActor={combatActor} />
      </div>
    </div>
  );
}
