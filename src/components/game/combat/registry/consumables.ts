import { Consumable } from "@/components/game/combat/types";
import { CombatEvent } from "@/machines/combatMachine/types";

export const minorHealthPotion = {
  name: "Health Potion",
  kind: "CONSUMABLE" as const,
  description: "Heal thyne fyne self",
  value: 10,
  weight: 1,
  image: "/images/healthPotion.png",
  onUse: () => ({ type: "HEAL", amount: 10 } as CombatEvent),
};

export const skipTurn = {
    name: "Skip Turn",
    kind: "CONSUMABLE" as const,
    description: "Let the enemy have some fun",
    value: 0,
    weight: 0,
    image: '',
    onUse: () => ({ type: "SKIP_TURN"} as CombatEvent)
}

export function generateConsumable(c: Omit<Consumable, "id">): Consumable {
  return {
    id: crypto.randomUUID(),
    kind: c.kind,
    name: c.name,
    description: c.description,
    value: c.value,
    weight: c.weight,
    image: c.image,
    onUse: c.onUse,
  };
}
