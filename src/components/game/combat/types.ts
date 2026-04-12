// Combat Specific Types

import { CombatEvent } from "@/machines/combatMachine/types";

export type BattleStats = {
  health: number;
  maxHealth: number;
  experience: number; // player - how much they have | enemy - how much they give
  attack: number;
  speed: number;
  defense: number;
  //   intimidation: number;  // could effect enemy chats | surrenders | flee-rate
  //   accuracy: number;
  //   evasion: number;
  //   critical: number;
  //   criticalMultiplier: number;
  //   criticalChance: number;
  //   statusEffects: StatusEffect[];
  //   items: Item[];
  //   equipment: Equipment[];
  //   skills: Skill[];
  //   spells: Spell[];
  //   abilities: Ability[];
  //   traits: Trait[];
  //   background: Background[];
};

export type Enemy = BattleStats & {
  id: string;
  image: string;
  name: string;
  selected: boolean;
  enemyType: string;
  chattiness: number;
  systemPrompt: string;
};

export type Player = BattleStats & {
  image: string;
  isDefending: boolean;
  inventory: InventoryItem[];
  unspentPoints: number;
};

export type AnyItem = Weapon | Armor | Consumable;

export type InventoryItem = {
  item: AnyItem;
  quantity: number;
};

export type Item = {
  id: string;
  name: string;
  description: string;
  image: string;
  value: number;
  weight: number;
};

export type Consumable = Item & {
  kind: "CONSUMABLE"
  onUse: () => CombatEvent
}

export type ArmorLocation = "HEAD" | "CHEST" | "ARMS" | "LEGS" | "FEET" | "HANDS"

export type Armor = Item & {
  kind: "ARMOR";
  def: number;
  location: ArmorLocation;
  equipped: boolean;
}

export type Weapon = Item & {
  kind: "WEAPON";
  att: number;
  accuracy: number;
  hands: 1 | 2;
  equipped: boolean;
}


export type CombatViews = "PLAYER" | "ENEMY" | "CHAT";
