// Combat Specific Types

export type BattleStats = {
  health: number;
  maxHealth: number;
  experience: number; // player - how much they have | enemy - how much they give
  attack: number;
  speed: number;
  defense: number;
  chattiness: number;
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
}

export type Enemy = extends BattleStats {
  id: string;
  image: string;
  name: string;
  selected: boolean;
  enemyType: string;
}

export type Player = extends BattleStats {
  image: string;
  // inventory: Item[];
}

export type Item = {
  id: string;
  name: string;
  description: string;
  image: string;
  type: "weapon" | "armor" | "consumable" | "quest" | "other";
  value: number;
  weight: number;
  quantity: number;
  effects: {
    [key: string]: number;
  }[];
}

export type CombatViews = "PLAYER" | "ENEMY" | "CHAT";
