import { BuildingDef, BuildingType } from '../types';

export const BUILDING_DEFS: Record<BuildingType, BuildingDef> = {
  nest: {
    type: 'nest',
    name: 'Monster Hatchery',
    emoji: '🥚',
    description: 'Houses your pets and incubates eggs. Each level increases pet capacity by 2.',
    baseCost: { gold: 0, gems: 0 },
    upgradeCost: { gold: 500, gems: 5 },
    effect: 'Capacity +2 per level',
  },
  garden: {
    type: 'garden',
    name: 'Resource Cabin',
    emoji: '🏡',
    description: 'A cozy cabin that grows food for your pets over time. Higher level = faster food.',
    baseCost: { gold: 200, gems: 0 },
    upgradeCost: { gold: 400, gems: 3 },
    effect: '1 food / 60s per level',
  },
  arena: {
    type: 'arena',
    name: 'Training Center',
    emoji: '🏟️',
    description: 'Unlocks battles and increases gold reward per level.',
    baseCost: { gold: 300, gems: 0 },
    upgradeCost: { gold: 600, gems: 5 },
    effect: '+20% gold rewards per level',
  },
  breeding_den: {
    type: 'breeding_den',
    name: 'Breeding Den',
    emoji: '💕',
    description: 'Where your pets can produce offspring. Each level reduces breed time.',
    baseCost: { gold: 500, gems: 2 },
    upgradeCost: { gold: 800, gems: 8 },
    effect: '-15% breed time per level',
  },
  gem_mine: {
    type: 'gem_mine',
    name: 'Gem Mine',
    emoji: '💎',
    description: 'Passively generates gems over time.',
    baseCost: { gold: 1000, gems: 10 },
    upgradeCost: { gold: 1500, gems: 15 },
    effect: '1 gem / 5min per level',
  },
  lab: {
    type: 'lab',
    name: 'Evolution Temple',
    emoji: '🔮',
    description: 'Ancient magic reduces XP needed for evolution and unlocks special abilities.',
    baseCost: { gold: 800, gems: 5 },
    upgradeCost: { gold: 1200, gems: 10 },
    effect: '-10% XP needed per level',
  },
};

export const BUILDING_ORDER: BuildingType[] = [
  'nest', 'garden', 'arena', 'breeding_den', 'gem_mine', 'lab'
];
