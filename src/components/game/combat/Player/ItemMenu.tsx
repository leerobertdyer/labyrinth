import ActionButton from "@/components/game/combat/ActionButton";
import { Item } from "@/components/game/combat/types";

export default function ItemMenu(items: Item[], callback: (item: Item) => void) {
  return items.map((item) => (
    <ActionButton key={item.id} onClick={() => callback} label={item.name} />
  ));
}
