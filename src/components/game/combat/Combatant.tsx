import { type Enemy } from "./types";

type CombatantProps = {
  combatant: Enemy;
  isSelected: boolean;
}

function StatView({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={`flex justify-between bg-black px-2 rounded-md text-xs text-white w-full text-center ${label ? "justify-between" : "justify-center"}`}
    >
      {label && <p>{label}</p>}
      <p>{value}</p>
    </div>
  );
}

export default function Combatant({ combatant, isSelected }: CombatantProps) {
  return (
    <div
      className={`flex flex-col items-center justify-end rounded-md min-h-[140px] border-2 w-fit p-4 gap-[2px]
        ${isSelected ? "border-red-400" : "border-black"}`}
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
