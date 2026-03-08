import Arena from "./Arena";
import { skeleton1, skeleton2, skeleton3 } from "./enemies";
import PlayerMenu from "./PlayerMenu";

export default function CombatView() {
  return (
    <div className="absolute inset-0 bg-black/75 z-1000 flex flex-col items-center justify-center h-screen">
      <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full">
        <Arena
          background="/backgrounds/dungeon.png"
          enemies={[skeleton1, skeleton2, skeleton3]}
        />

        <PlayerMenu />

        <div className="col-span-4 row-span-2 bg-black/60 rounded-xs w-full border-2 border-yellow-800 p-2 text-white flex flex-col items-center justify-center gap-2">
          {/* @TODO: LLM Dialogue Box for the enemy! */}
          <div className="flex flex-col items-center justify-center bg-white rounded-md p-4 text-black w-full">
            <p>Skeleton: "You seem to be lost! I will not let you pass!"</p>
          </div>
          <input type="text" className="bg-white rounded-md p-2 w-full text-black" placeholder="Enter your response..." />
          <button className="bg-yellow-800/30 text-white rounded-md p-2 w-full cursor-pointer hover:bg-yellow-800/90 transition-all duration-300">
            Respond
          </button>
        </div>
      </div>
    </div>
  );
}
