import Arena from "./Arena";
import { skeleton1 } from "./enemies";
import PlayerMenu from "./PlayerMenu";

export default function CombatView() {
  return (
    <div className="absolute inset-0 bg-black/75 z-1000 flex flex-col items-center justify-center h-screen">
      <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full">
        <Arena
          enemies={[
          skeleton1,
          skeleton1,
          skeleton1,
          ]}
        />

        <PlayerMenu />

        <div className="col-span-4 row-span-2 bg-blue-200 rounded-xs w-full">
          <h2>MENU</h2>
        </div>
      </div>
    </div>
  );
}
