import { type Combatant } from "./types";

interface CombatantProps {
  combatant: Combatant;
}

function StatView({ label, value }: { label: string; value: string }) {
  return (
    <div className={`flex justify-between bg-black px-2 rounded-md text-xs text-white w-full text-center ${label ? "justify-between" : "justify-center"}`}>
      {label && <p>{label}</p>}
      <p>{value}</p>
    </div>
  );
}

export default function Combatant({ combatant }: CombatantProps) {
  return (
    <div
      className="flex flex-col items-center justify-end rounded-md min-h-[140px] border-2 border-black w-fit p-4 gap-[2px]"
      style={{
        backgroundImage: `url(/sprites/${combatant.image})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
      }}
    >
      <StatView label="" value={combatant.name} />
      <StatView
        label="HP"
        value={`${combatant.health} / ${combatant.maxHealth}`}
      />
    </div>
  );
}
