import { useGameMachine } from "@/contexts/GameMachineContext";
import { useEffect, useRef, useState } from "react";
import { eventKeyToControl } from "./combatControls";
import type { CombatViews } from "./types";

const MENU_ACTION_COUNT = 5;

function ActionButton({
  label,
  onClick,
  isSelected,
}: {
  label: string;
  onClick: () => void;
  isSelected?: boolean;
}) {
  return (
    <button
      className={`w-full border-2 cursor-pointer transition-all duration-300 ${
        isSelected
          ? "bg-gray-600 border-yellow-500 hover:bg-gray-600"
          : "bg-gray-400 border-black hover:bg-gray-500"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type PlayerMenuProps = {
  isPlayersTurn: boolean;
  selectedView: CombatViews;
  combatActor: NonNullable<
    ReturnType<typeof useGameMachine>[0]["children"]["combatActor"]
  >;
}

export default function PlayerMenu({
  isPlayersTurn,
  selectedView,
  combatActor,
}: PlayerMenuProps) {
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const selectedMenuIndexRef = useRef(selectedMenuIndex);
  // @todo fix this:
  // eslint-disable-next-line react-hooks/refs
  selectedMenuIndexRef.current = selectedMenuIndex;

  const playerViewActive = selectedView === "PLAYER";

  useEffect(() => {
    console.log("Entering useEffect in playerMenu: ", { combatActor });
    const handler = (event: KeyboardEvent) => {
      if (selectedView !== "PLAYER") return;
      const action = eventKeyToControl(event);
      if (!action || !combatActor || !isPlayersTurn) return;
      switch (action) {
        case "MENU_UP":
          setSelectedMenuIndex((i) => Math.max(0, i - 1));
          break;
        case "MENU_DOWN":
          setSelectedMenuIndex((i) => Math.min(MENU_ACTION_COUNT - 1, i + 1));
          break;
        case "SELECT":
          const idx = selectedMenuIndexRef.current;
          if (idx === 0) combatActor.send({ type: "SET_VIEW", view: "ENEMY" });
          else if (idx === 1) combatActor.send({ type: "DEFEND" });
          else if (idx === 2)
            combatActor.send({ type: "USE_ITEM", itemId: "todo" });
          else if (idx === 3) combatActor.send({ type: "FLEE" });
          else if (idx === 4) combatActor.send({ type: "SET_VIEW", view: "CHAT"})
          break;
        case "BACK":
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedView, isPlayersTurn, combatActor]);

  const handleAttack = () => {
    if (!combatActor) return;
    combatActor.send({ type: "SET_VIEW", view: "ENEMY" });
  };

  const handleRun = () => {
    combatActor?.send({ type: "FLEE" });
  };

  const handleDefend = () => {
    combatActor?.send({ type: "DEFEND" });
  };

  const handleItem = () => {
    combatActor?.send({ type: "USE_ITEM", itemId: "todo" });
  };

  const handleChat = () => {
    console.log("handleChat before: ", { combatActor, selectedView})
    combatActor?.send({ type: "SET_VIEW", view: "CHAT" });
  };

  const player = combatActor?.getSnapshot().context.player;
  if (!player) return null;

  function StatView({ label, value }: { label: string; value: string }) {
    return (
      <div className="flex justify-between bg-black px-2 rounded-md text-xs text-white w-full text-center">
        {label && <p>{label}</p>}
        <p>{value}</p>
      </div>
    );
  }

  return (
    <div
      className={`col-span-2 row-span-6 border-2 bg-black
        ${isPlayersTurn ? "border-green-800" : "border-white"}
         rounded-xs w-full flex flex-col items-center justify-start pt-4 gap-4 relative`}
    >
      {!playerViewActive && (
        <div className="absolute inset-0 bg-black/35 w-full h-full z-200"></div>
      )}

      <div
        className="rounded-md border-2 border-black p-4 h-60 w-37.5"
        style={{
          backgroundImage: `url(/sprites/Hero.png)`,
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="flex flex-col items-center justify-center bg-gray-200 rounded-md p-4 gap-0.5">
        <h1 className="text-black text-lg font-bold border-b-2 border-black mb-2">
          Player Actions
        </h1>
        <ActionButton
          label="Attack"
          onClick={isPlayersTurn ? handleAttack : () => {}}
          isSelected={selectedMenuIndex === 0}
        />
        <ActionButton
          label="Defend"
          onClick={isPlayersTurn ? handleDefend : () => {}}
          isSelected={selectedMenuIndex === 1}
        />
        <ActionButton
          label="Item"
          onClick={isPlayersTurn ? handleItem : () => {}}
          isSelected={selectedMenuIndex === 2}
        />
        <ActionButton
          label="Run"
          onClick={isPlayersTurn ? handleRun : () => {}}
          isSelected={selectedMenuIndex === 3}
        />
        <ActionButton
          label="Chat"
          onClick={isPlayersTurn ? handleChat : () => {}}
          isSelected={selectedMenuIndex === 4}
        />
      </div>
      <div className="flex flex-col items-center justify-center bg-gray-200 rounded-md p-4 gap-0.5">
        <h1 className="text-black text-lg font-bold border-b-2 border-black mb-2">
          Stats
        </h1>
        <StatView label="HP" value={`${player.health} / ${player.maxHealth}`} />
        <StatView label="Attack" value={`${player.attack}`} />
      </div>
    </div>
  );
}
