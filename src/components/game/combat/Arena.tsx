import Combatant from "./Combatant";
import { type Combatant as Enemy } from "./types";

interface ArenaProps {
  enemies: Enemy[];
}

export default function Arena({ enemies }: ArenaProps) {
  return (
    <div className="col-span-4 row-span-4 bg-white rounded-xs w-full flex flex-wrap items-center justify-center gap-4">
      {enemies.map((enemy) => (
        <Combatant key={enemy.id} combatant={enemy} />
      ))}
    </div>
  );
}