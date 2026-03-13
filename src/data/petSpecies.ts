import { PetSpecies } from '../types';

export const PET_SPECIES: PetSpecies[] = [
  {
    id: 'firefoxen',
    name: 'Firefoxen',
    type: 'fire',
    rarity: 'uncommon',
    emojis: { egg: '🥚', baby: '🦊', teen: '🦊', adult: '🦊', elder: '🦊' },
    description: 'A fiery fox spirit born from volcanic embers.',
    flavorText: '"Its tail burns brighter with every battle won."',
    baseStats: { hp: 70, attack: 85, defense: 55, speed: 90 },
    breedsWith: ['lightbun', 'stormeagle'],
  },
  {
    id: 'aquapup',
    name: 'Aquapup',
    type: 'water',
    rarity: 'common',
    emojis: { egg: '🥚', baby: '🐶', teen: '🐶', adult: '🐶', elder: '🐶' },
    description: 'A cheerful water-dog that loves swimming in rivers.',
    flavorText: '"Always splashing, always smiling."',
    baseStats: { hp: 80, attack: 65, defense: 75, speed: 70 },
    breedsWith: ['leafbear', 'shockrat'],
  },
  {
    id: 'leafbear',
    name: 'Leafbear',
    type: 'grass',
    rarity: 'common',
    emojis: { egg: '🥚', baby: '🐻', teen: '🐻', adult: '🐻', elder: '🐻' },
    description: 'A gentle bear cub wrapped in enchanted forest leaves.',
    flavorText: '"Its fur smells of pine and morning dew."',
    baseStats: { hp: 95, attack: 60, defense: 90, speed: 45 },
    breedsWith: ['aquapup', 'stonedrak'],
  },
  {
    id: 'shockrat',
    name: 'Shockrat',
    type: 'electric',
    rarity: 'uncommon',
    emojis: { egg: '🥚', baby: '🐭', teen: '🐭', adult: '🐭', elder: '🐭' },
    description: 'A hyperactive rodent crackling with static electricity.',
    flavorText: '"Never sits still. Lightning fast—literally."',
    baseStats: { hp: 60, attack: 80, defense: 50, speed: 110 },
    breedsWith: ['aquapup', 'stormeagle'],
  },
  {
    id: 'stormeagle',
    name: 'Stormeagle',
    type: 'air',
    rarity: 'rare',
    emojis: { egg: '🥚', baby: '🐦', teen: '🦅', adult: '🦅', elder: '🦅' },
    description: 'A majestic eagle born in the eye of a thunderstorm.',
    flavorText: '"Its wings can create hurricanes with a single beat."',
    baseStats: { hp: 75, attack: 90, defense: 60, speed: 100 },
    breedsWith: ['firefoxen', 'shockrat'],
  },
  {
    id: 'stonedrak',
    name: 'Stonedrak',
    type: 'rock',
    rarity: 'rare',
    emojis: { egg: '🥚', baby: '🦕', teen: '🦖', adult: '🦖', elder: '🦖' },
    description: 'An ancient reptile whose scales are pure obsidian.',
    flavorText: '"Moves slowly, but nothing can pierce its hide."',
    baseStats: { hp: 110, attack: 70, defense: 110, speed: 35 },
    breedsWith: ['leafbear', 'shadowcat'],
  },
  {
    id: 'shadowcat',
    name: 'Shadowcat',
    type: 'dark',
    rarity: 'epic',
    emojis: { egg: '🖤', baby: '🐱', teen: '🐱', adult: '🐈‍⬛', elder: '🐈‍⬛' },
    description: 'A mysterious feline that phases through shadows at will.',
    flavorText: '"By the time you see it, it\'s already gone."',
    baseStats: { hp: 80, attack: 100, defense: 65, speed: 95 },
    breedsWith: ['stonedrak', 'lunabun'],
  },
  {
    id: 'lunabun',
    name: 'Lunabun',
    type: 'light',
    rarity: 'epic',
    emojis: { egg: '✨', baby: '🐰', teen: '🐰', adult: '🐇', elder: '🐇' },
    description: 'A celestial rabbit blessed by the moon goddess.',
    flavorText: '"Its glow can heal wounds and lift the spirits of allies."',
    baseStats: { hp: 85, attack: 75, defense: 80, speed: 85 },
    breedsWith: ['shadowcat', 'firefoxen'],
  },
  {
    id: 'voidwyrm',
    name: 'Voidwyrm',
    type: 'dark',
    rarity: 'legendary',
    emojis: { egg: '🌑', baby: '🐉', teen: '🐉', adult: '🐲', elder: '🐲' },
    description: 'A dragon forged from the void between stars. Incredibly rare.',
    flavorText: '"It has seen the end of worlds and survived."',
    baseStats: { hp: 130, attack: 130, defense: 100, speed: 80 },
    breedsWith: ['shadowcat', 'stormeagle'],
  },
];

export const SPECIES_MAP = Object.fromEntries(PET_SPECIES.map(s => [s.id, s]));

export const TYPE_COLORS: Record<string, string> = {
  fire: 'text-orange-400 bg-orange-900/30',
  water: 'text-blue-400 bg-blue-900/30',
  grass: 'text-green-400 bg-green-900/30',
  electric: 'text-yellow-400 bg-yellow-900/30',
  air: 'text-cyan-400 bg-cyan-900/30',
  rock: 'text-stone-400 bg-stone-900/30',
  dark: 'text-purple-400 bg-purple-900/30',
  light: 'text-yellow-200 bg-yellow-900/20',
};

export const TYPE_ICONS: Record<string, string> = {
  fire: '🔥', water: '💧', grass: '🌿', electric: '⚡',
  air: '🌪️', rock: '🪨', dark: '🌑', light: '✨',
};

export const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-300 border-gray-500',
  uncommon: 'text-green-400 border-green-500',
  rare: 'text-blue-400 border-blue-500',
  epic: 'text-purple-400 border-purple-500',
  legendary: 'text-yellow-400 border-yellow-500',
};

export const RARITY_GLOW: Record<string, string> = {
  common: '',
  uncommon: 'shadow-green-500/30',
  rare: 'shadow-blue-500/50',
  epic: 'shadow-purple-500/60',
  legendary: 'shadow-yellow-500/80',
};

// Type advantage multipliers
export const TYPE_CHART: Record<string, Record<string, number>> = {
  fire:     { grass: 1.5, air: 1.5, water: 0.5, rock: 0.5 },
  water:    { fire: 1.5, rock: 1.5, grass: 0.5, electric: 0.5 },
  grass:    { water: 1.5, rock: 1.5, fire: 0.5, air: 0.5 },
  electric: { water: 1.5, air: 1.5, grass: 0.5, rock: 0.5 },
  air:      { grass: 1.5, electric: 0.5, rock: 1.5 },
  rock:     { fire: 1.5, air: 1.5, water: 0.5, grass: 0.5 },
  dark:     { light: 1.5, dark: 0.5 },
  light:    { dark: 1.5, light: 0.5 },
};

export function getTypeAdvantage(attackerType: string, defenderType: string): number {
  return TYPE_CHART[attackerType]?.[defenderType] ?? 1.0;
}

export function getPetEmoji(speciesId: string, stage: string): string {
  const species = SPECIES_MAP[speciesId];
  if (!species) return '❓';
  return species.emojis[stage as EvolutionStage] ?? '🥚';
}

// Stage thresholds by level
export function getStageForLevel(level: number): string {
  if (level < 5) return 'baby';
  if (level < 15) return 'teen';
  if (level < 30) return 'adult';
  return 'elder';
}

type EvolutionStage = 'egg' | 'baby' | 'teen' | 'adult' | 'elder';
