import { useGameMachine } from "@/contexts/GameMachineContext";

export default function DeathScreen({ room="startingRoom" }: { room: string }) {
  const [, send] = useGameMachine();

  return (
    <div
      className="absolute inset-0 z-1000 flex justify-center items-center"
      style={{
        backgroundImage: 'url("/images/backgrounds/dungeon.png")',
        backgroundSize: "cover",
        backgroundPositionX: "-200px",
      }}
    >
      <div
        style={{
          backgroundImage: 'url("/images/skull.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="m-auto text-red-500 w-[50vw] h-[60vh] flex flex-col items-center justify-center rounded-2xl overflow-hidden"
      >
        <div className="bg-black/80 p-6 flex flex-col items-center justify-around gap-4 w-full h-full">
          <h1 className="text-amber-100">You have lost your way...</h1>
          <button
            onClick={() => send({ type: "RESPAWN", room })}
            className="border-amber-100 border-2 rounded-md p-4 bg-black cursor-pointer hover:bg-amber-100 hover:text-black"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
