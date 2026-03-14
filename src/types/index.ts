export type PetType = 'fire' | 'water' | 'grass' | 'rock' | 'air' | 'dark' | 'light' | 'electric';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EvolutionStage = 'egg' | 'baby' | 'teen' | 'adult' | 'elder';
export type BuildingType = 'nest' | 'garden' | 'arena' | 'breeding_den' | 'gem_mine' | 'lab';
export type ActiveView = 'base' | 'collection' | 'battle' | 'breeding' | 'shop';
export type EvolutionVariant = 'stellar' | 'normal' | 'feral';

export interface PetSpecies {
  id: string;
  name: string;
  type: PetType;
  rarity: Rarity;
  emojis: Record<EvolutionStage, string>;
  description: string;
  flavorText: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  breedsWith: string[];
}

export interface Pet {
  id: string;
  speciesId: string;
  nickname: string;
  stage: EvolutionStage;
  level: number;
  xp: number;
  xpToNext: number;
  stats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  needs: {
    hunger: number;
    happiness: number;
    energy: number;
  };
  skinId?: string;
  evolutionVariant?: EvolutionVariant;
  careScore?: number;
  isInTeam: boolean;
  isBreeding: boolean;
  acquiredAt: number;
}

export interface BuildingDef {
  type: BuildingType;
  name: string;
  emoji: string;
  description: string;
  baseCost: { gold: number; gems: number };
  upgradeCost: { gold: number; gems: number };
  effect: string;
}

export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  level: number;
  x: number;   // percentage 0–100 within terrain canvas
  y: number;   // percentage 0–100 within terrain canvas
}

export interface BreedingTask {
  id: string;
  parent1Id: string;
  parent2Id: string;
  startTime: number;
  duration: number;
  resultSpeciesId: string;
  completed: boolean;
}

export interface BattleEnemy {
  id: string;
  name: string;
  speciesId: string;
  stage: EvolutionStage;
  level: number;
  stats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export interface BattleState {
  playerTeam: string[];
  enemies: BattleEnemy[];
  playerIndex: number;
  enemyIndex: number;
  playerHps: Record<string, number>;
  enemyHps: Record<string, number>;
  turn: 'player' | 'enemy' | 'done';
  log: string[];
  result: 'win' | 'lose' | null;
  goldReward: number;
  xpReward: number;
  round: number;
}

export interface PetSkin {
  id: string;
  name: string;
  speciesId: string;
  emoji: string;
  cost: { gems: number };
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'eggs' | 'food' | 'skins' | 'speedups' | 'gems';
  cost: { gold?: number; gems?: number; real?: number };
  emoji: string;
  value: number | string;
}
