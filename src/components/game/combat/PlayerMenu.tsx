import { useGameMachine } from "@/contexts/GameMachineContext";

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full bg-gray-400 border-2 border-black cursor-pointer hover:bg-gray-500 transition-all duration-300"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

interface PlayerMenuProps {
  isPlayersTurn: boolean;
}

export default function PlayerMenu({ isPlayersTurn }: PlayerMenuProps) {
  const [state] = useGameMachine();

  const combatActor = state.children.combatActor;

  const handleAttack = () => {
    combatActor?.send({ type: "SET_VIEW", view: "ENEMY" });
    console.log("Set View To ENEMY from player menu:", combatActor?.getSnapshot().context);
  };

  const handleRun = () => {
    combatActor?.send({ type: "FLEE" });
  };

  const handleDefend = () => {
    combatActor?.send({ type: "DEFEND" });
  };

  const handleItem = () => {
    combatActor?.send({ type: "USE_ITEM", itemId: "fake" });
  };

  return (
    <div
      className={`col-span-2 row-span-6 border-2 bg-black
        ${isPlayersTurn ? "border-green-800" : "border-white"}
         rounded-xs w-full flex flex-col items-center justify-start pt-4 gap-4`}
    >
      <div
        className="rounded-md border-2 border-black p-4 h-[240px] w-[150px]"
        style={{
          backgroundImage: `url(/sprites/Hero.png)`,
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="flex flex-col items-center justify-center bg-gray-200 rounded-md p-4 gap-[2px]">
        <h1 className="text-black text-lg font-bold border-b-2 border-black mb-2">
          XXX's Actions
        </h1>
        <ActionButton label="Attack" onClick={isPlayersTurn ? handleAttack : () => {}} />
        <ActionButton label="Defend" onClick={isPlayersTurn ? handleDefend : () => {}} />
        <ActionButton label="Item" onClick={isPlayersTurn ? handleItem : () => {}} />
        <ActionButton label="Run" onClick={isPlayersTurn ? handleRun : () => {}} />
      </div>
    </div>
  );
}
