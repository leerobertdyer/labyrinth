import { useGameMachine } from "@/contexts/GameMachineContext";

export default function StartScreen() {
  const [, send] = useGameMachine();

  return (
    <div
      className="absolute inset-0 z-1000"
      style={{
        backgroundImage: 'url("/images/backgrounds/startArt.png")',
        backgroundSize: "cover",
        backgroundPositionX: "-200px",
      }}
    >
      <div className="bg-black/40 text-red-400 w-full h-screen flex flex-col items-end justify-end p-8">
        <button 
            onClick={() => send({ type: "START_GAME" })}
        className="border-amber-200 border-2 rounded-md p-4 cursor-pointer hover:bg-amber-200 hover:text-black">
          Start Game
        </button>
      </div>
    </div>
  );
}
