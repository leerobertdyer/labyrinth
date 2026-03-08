import { useGameMachine } from "@/contexts/GameMachineContext";

function ActionButton({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button className="w-full bg-gray-400 border-2 border-black cursor-pointer hover:bg-gray-500 transition-all duration-300" onClick={onClick}>
      {label}
    </button>
  );
}

export default function PlayerMenu() {
    const [state] = useGameMachine();
  
    const combatActor = state.children.combatActor;
  
    const handleAttack = () => {
      combatActor?.send({ type: 'ATTACK' });
      console.log("Attacked enemy:", state.context.enemies);
    };

    const handleRun = () => {
      combatActor?.send({ type: 'FLEE' });
    };

  return (
    <div className="col-span-2 row-span-6 bg-white rounded-xs w-full flex flex-col items-center justify-start pt-4 gap-4">
      <div
        className="rounded-md border-2 border-black p-4 h-[240px] w-[150px]"
        style={{
          backgroundImage: `url(/sprites/Hero.png)`,
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="flex flex-col items-center justify-center bg-gray-200 rounded-md p-4 gap-[2px]">
        <h1 className="text-black text-lg font-bold border-b-2 border-black mb-2">XXX's Actions</h1>
        <ActionButton label="Attack" onClick={handleAttack} />
        <ActionButton label="Defend" onClick={() => {}} />
        <ActionButton label="Item" onClick={() => {}} />
        <ActionButton label="Run" onClick={handleRun} />
      </div>
    </div>
  );
}
