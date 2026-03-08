import Combatant from "./Combatant";
import { type Enemy } from "./types";

interface ArenaProps {
  enemies: Enemy[];
  background: string;
}

export default function Arena({ enemies, background }: ArenaProps) {
  return (
    <div className="col-span-4 row-span-4 bg-white rounded-xs w-full flex flex-wrap items-center justify-center gap-4"
    style={{
      backgroundImage: `url(${background})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
    >
      {enemies.map((enemy) => (
        <Combatant key={enemy.id} combatant={enemy} />
      ))}
    </div>
  );
}