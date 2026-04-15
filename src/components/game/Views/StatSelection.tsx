import { Player } from "@/components/game/combat/types";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { useState } from "react";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";

function StatBox({
  name,
  amount,
  onPlus,
  onMinus,
}: {
  name: string;
  amount: number;
  onPlus: () => void;
  onMinus: () => void;
}) {
  return (
    <div className="w-full flex justify-around">
      <p className="w-20">{name}</p>
      <div className="flex justify-between items-center gap-2 min-w-[5rem]">
        <button
          className="cursor-pointer hover:text-black hover:bg-red-500 rounded-xs"
          onClick={onMinus}
        >
          <CiSquareMinus />
        </button>
        <p className="text-green-400 leading-0 h-[5px]">{amount}</p>
        <button
          className="cursor-pointer hover:text-black hover:bg-amber-400 rounded-xs"
          onClick={onPlus}
        >
          <CiSquarePlus />
        </button>
      </div>
    </div>
  );
}

export default function StatSelection({ p }: { p: Player }) {
  const [state, send] = useGameMachine();
  
  const [remainingPoints, setRemainingPoints] = useState(p.unspentPoints);
  const [stats, setStats] = useState({
    health: p.maxHealth,
    attack: p.attack,
    defense: p.defense,
    speed: p.speed,
  });

  function finalizeStats() {
    // const actor = state.children.actor
    // if (!actor) return
    send({
      type: "CONFIRM_STATS",
      player: {
        ...state.context.player,
        maxHealth: stats.health,
        health: stats.health,
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
      },
    });
  }

  function handleStatChange(
    s: "health" | "attack" | "defense" | "speed",
    up: boolean,
  ) {
    if (up && remainingPoints === 0) return;
    if (!up && stats[s] <= 1) return;
    if (!up && stats[s] <= p[s]) return
    setStats((prev) => ({ ...prev, [s]: up ? prev[s] + 1 : prev[s] - 1 }));
    setRemainingPoints((prev) => (up ? prev - 1 : prev + 1));
  }

  return (
    <div id="mainStatDiv" className="absolute inset-0 z-1000 flex justify-center items-center w-full h-full gap-2 bg-black">
      <div
        className="w-full h-full md:w-[60rem] md:h-[35rem] relative"
        style={{
          backgroundImage: 'url("/images/backgrounds/StatScreen.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="
            absolute top-55 left-0 
            md:top-46 md:left-50 
            w-full h-[45%] p-4 md:p-2
            md:w-[35rem] md:h-[15rem] 
            flex flex-col items-center justify-around"
        >
          <div>
            <h1 className="text-center text-3xl text-amber-400">Level Up</h1>
            <h2 className="text-center text-lg text-amber-200">
              Points: {remainingPoints}
            </h2>
          </div>
          <StatBox
            name="Health"
            amount={stats.health}
            onPlus={() => handleStatChange("health", true)}
            onMinus={() => handleStatChange("health", false)}
          />
          <StatBox
            name="Attack"
            amount={stats.attack}
            onPlus={() => handleStatChange("attack", true)}
            onMinus={() => handleStatChange("attack", false)}
          />
          <StatBox
            name="Defense"
            amount={stats.defense}
            onPlus={() => handleStatChange("defense", true)}
            onMinus={() => handleStatChange("defense", false)}
          />
          <StatBox
            name="Speed"
            amount={stats.speed}
            onPlus={() => handleStatChange("speed", true)}
            onMinus={() => handleStatChange("speed", false)}
          />
          {remainingPoints === 0 && (
            <button
              className="border-2 border-white p-1 cursor-pointer bg-red-900 hover:bg-white hover:text-black rounded-sm h-fit"
              onClick={finalizeStats}
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
