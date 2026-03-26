import { useGameMachine } from "@/contexts/GameMachineContext";
import { useEffect, useEffectEvent, useState } from "react";
import type { AnyItem, CombatViews, InventoryItem } from "../types";
import { eventKeyToControl } from "@/components/game/combat/combatControls";
import ActionButton from "@/components/game/combat/ActionButton";
import { useSelector } from "@xstate/react";

const playerMenuActions = ["ATTACK", "DEFEND", "USE_ITEM", "FLEE", "CHAT"];

type PlayerMenuProps = {
  isPlayersTurn: boolean;
  selectedView: CombatViews;
  combatActor: NonNullable<
    ReturnType<typeof useGameMachine>[0]["children"]["combatActor"]
  >;
};

export default function PlayerMenu({
  isPlayersTurn,
  selectedView,
  combatActor,
}: PlayerMenuProps) {
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [showItems, setShowItems] = useState(false);

  const playerViewActive = selectedView === "PLAYER";

  const handleAttack = () => {
    combatActor?.send({ type: "SET_VIEW", view: "ENEMY" });
  };

  const handleDefend = () => {
    combatActor?.send({ type: "DEFEND" });
  };

  const handleItem = () => {
    setSelectedMenuIndex(0);
    setShowItems(true);
  };

  const consumeItem = (item: InventoryItem) => {
    combatActor?.send({ type: "USE_ITEM", item });
    setShowItems(false);
  };

  const handleFleeAttempt = () => {
    const EXPONENT = 2;
    const context = combatActor.getSnapshot().context;
    const playerSpeedCheck = Math.pow(
      Math.random() * context.player.speed,
      EXPONENT,
    );
    const fastestEnemyCheck = Math.pow(
      Math.random() * Math.max(0, ...context.enemies.map((e) => e.speed)),
      EXPONENT,
    );
    const success = playerSpeedCheck > fastestEnemyCheck;
    combatActor.send({ type: "FLEE", success });
  };

  const handleChat = () => {
    combatActor?.send({ type: "SET_VIEW", view: "CHAT" });
  };

  const combatActions = () => {
    if (selectedMenuIndex === 0) handleAttack();
    else if (selectedMenuIndex === 1) handleDefend();
    else if (selectedMenuIndex === 2) handleItem();
    else if (selectedMenuIndex === 3) handleFleeAttempt();
    else if (selectedMenuIndex === 4) handleChat();
  };

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (selectedView !== "PLAYER") return;
    const action = eventKeyToControl(event);
    if (!action || !combatActor || !isPlayersTurn) return;
    const player = combatActor.getSnapshot().context.player;
    const lastIndex = showItems
      ? player.inventory.length
      : playerMenuActions.length - 1;

    switch (action) {
      case "MENU_UP":
        setSelectedMenuIndex((i) => {
          console.log({ player, lastIndex, i, selectedMenuIndex });
          if (i === 0) return lastIndex;
          return Math.max(0, i - 1);
        });
        break;
      case "MENU_DOWN":
        setSelectedMenuIndex((i) => {
          if (i === lastIndex) return 0;
          return Math.min(lastIndex, i + 1);
        });
        break;
      case "SELECT":
        if (showItems) {
          if (selectedMenuIndex === 0) {
            setShowItems(false);
            setSelectedMenuIndex(0);
          } else {
            const item = player.inventory[selectedMenuIndex - 1];
            if (item?.item.kind === "CONSUMABLE") consumeItem(item);
          }
        } else {
          combatActions();
        }
        break;
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const player = useSelector(combatActor, (s) => s.context.player);

  if (!player) return null;

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
      {showItems ? (
        <>
          ITEMS
          <ActionButton
            label="Back"
            isSelected={selectedMenuIndex === 0}
            onClick={() => setShowItems(false)}
          />
          {player.inventory.map((i: InventoryItem, index) => (
            <ActionButton
              key={i.item.id}
              label={i.item.name}
              isSelected={selectedMenuIndex === index + 1}
              onClick={() => {
                if (i.item.kind === "CONSUMABLE") {
                  consumeItem(i);
                }
              }}
            />
          ))}
        </>
      ) : (
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
            onClick={isPlayersTurn ? handleFleeAttempt : () => {}}
            isSelected={selectedMenuIndex === 3}
          />
          <ActionButton
            label="Chat"
            onClick={isPlayersTurn ? handleChat : () => {}}
            isSelected={selectedMenuIndex === 4}
          />
        </div>
      )}
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

function StatView({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between bg-black px-2 rounded-md text-xs text-white w-full text-center">
      {label && <p>{label}</p>}
      <p>{value}</p>
    </div>
  );
}
