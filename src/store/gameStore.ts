import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Pet, BasePlot, PlacedBuilding, BreedingTask, BattleState,
  ActiveView, BuildingType, BattleEnemy, EvolutionStage, EvolutionVariant,
} from '../types';
import { PET_SPECIES, SPECIES_MAP, getTypeAdvantage, getStageForLevel } from '../data/petSpecies';
import { BUILDING_DEFS } from '../data/buildingData';
import { SHOP_ITEMS } from '../data/shopItems';

let petIdCounter = 1;
function newPetId() { return `pet_${petIdCounter++}_${Date.now()}`; }

let buildingIdCounter = 1;
function newBuildingId() { return `bld_${buildingIdCounter++}`; }

function calcXpToNext(level: number): number {
  return level * 50;
}

function createPet(speciesId: string, level = 1): Pet {
  const species = SPECIES_MAP[speciesId];
  if (!species) throw new Error(`Unknown species: ${speciesId}`);
  const stage = getStageForLevel(level) as EvolutionStage;
  const mult = 1 + (level - 1) * 0.1;
  return {
    id: newPetId(),
    speciesId,
    nickname: species.name,
    stage,
    level,
    xp: 0,
    xpToNext: calcXpToNext(level),
    stats: {
      hp: Math.round(species.baseStats.hp * mult),
      maxHp: Math.round(species.baseStats.hp * mult),
      attack: Math.round(species.baseStats.attack * mult),
      defense: Math.round(species.baseStats.defense * mult),
      speed: Math.round(species.baseStats.speed * mult),
    },
    needs: { hunger: 80, happiness: 80, energy: 90 },
    evolutionVariant: 'normal' as EvolutionVariant,
    careScore: 80,
    isInTeam: false,
    isBreeding: false,
    acquiredAt: Date.now(),
  };
}

function createInitialPlots(): BasePlot[] {
  const plots: BasePlot[] = [];
  let plotId = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const isUnlocked = row < 2 && col < 2;
      const unlockGold = (row + col + 1) * 500;
      plots.push({
        id: `plot_${plotId++}`,
        col,
        row,
        unlocked: isUnlocked,
        unlockCost: { gold: unlockGold, gems: 0 },
      });
    }
  }
  return plots;
}

function createInitialBuildings(plots: BasePlot[]): { buildings: PlacedBuilding[]; plots: BasePlot[] } {
  const buildings: PlacedBuilding[] = [];
  const updatedPlots = [...plots];

  const nestPlot = updatedPlots.find(p => p.col === 0 && p.row === 0)!;
  const nestBuilding: PlacedBuilding = { id: newBuildingId(), type: 'nest', level: 1, plotId: nestPlot.id };
  buildings.push(nestBuilding);
  updatedPlots[updatedPlots.indexOf(nestPlot)] = { ...nestPlot, buildingId: nestBuilding.id };

  const gardenPlot = updatedPlots.find(p => p.col === 1 && p.row === 0)!;
  const gardenBuilding: PlacedBuilding = { id: newBuildingId(), type: 'garden', level: 1, plotId: gardenPlot.id };
  buildings.push(gardenBuilding);
  updatedPlots[updatedPlots.indexOf(gardenPlot)] = { ...gardenPlot, buildingId: gardenBuilding.id };

  return { buildings, plots: updatedPlots };
}

function generateEnemyTeam(round: number): BattleEnemy[] {
  const species = PET_SPECIES.filter(s => s.rarity !== 'legendary');
  const level = Math.max(1, round * 2);
  const count = Math.min(3, 1 + Math.floor(round / 2));
  const enemies: BattleEnemy[] = [];
  for (let i = 0; i < count; i++) {
    const s = species[Math.floor(Math.random() * species.length)];
    const mult = 1 + (level - 1) * 0.1;
    enemies.push({
      id: `enemy_${i}`,
      name: `Wild ${s.name}`,
      speciesId: s.id,
      stage: getStageForLevel(level) as EvolutionStage,
      level,
      stats: {
        hp: Math.round(s.baseStats.hp * mult),
        maxHp: Math.round(s.baseStats.hp * mult),
        attack: Math.round(s.baseStats.attack * mult),
        defense: Math.round(s.baseStats.defense * mult),
        speed: Math.round(s.baseStats.speed * mult),
      },
    });
  }
  return enemies;
}

function pickBreedResult(s1Id: string, s2Id: string): string {
  const s1 = SPECIES_MAP[s1Id];
  const s2 = SPECIES_MAP[s2Id];
  const candidates = PET_SPECIES.filter(
    s => s.id !== s1Id && s.id !== s2Id && (
      s.type === s1.type || s.type === s2.type ||
      s1.breedsWith.includes(s.id) || s2.breedsWith.includes(s.id)
    )
  );
  if (candidates.length === 0) return PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)].id;
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}

interface GameStore {
  // Resources
  gold: number;
  gems: number;
  food: number;
  speedups: number;

  // Pets & collection
  pets: Pet[];
  discoveredSpecies: string[];

  // Base
  plots: BasePlot[];
  buildings: PlacedBuilding[];

  // Team
  activeTeam: string[];

  // Breeding
  breedingTasks: BreedingTask[];

  // Battle
  battle: BattleState | null;
  battlesWon: number;

  // Owned skins
  ownedSkins: string[];

  // Game ticks
  lastTick: number;
  lastGardenTick: number;
  lastGemTick: number;

  // UI
  activeView: ActiveView;
  selectedPetId: string | null;
  showBattleSetup: boolean;

  // Notifications
  notifications: { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[];

  // Actions
  gameTick: () => void;
  feedPet: (petId: string) => void;
  playWithPet: (petId: string) => void;
  restPet: (petId: string) => void;
  renamePet: (petId: string, name: string) => void;
  addToTeam: (petId: string) => void;
  removeFromTeam: (petId: string) => void;
  unlockPlot: (plotId: string) => void;
  buildOnPlot: (plotId: string, type: BuildingType) => void;
  upgradeBuilding: (buildingId: string) => void;
  startBreeding: (pet1Id: string, pet2Id: string) => void;
  collectBreeding: (taskId: string) => void;
  speedupBreeding: (taskId: string) => void;
  startBattle: () => void;
  performAttack: () => void;
  performSpecial: () => void;
  performFlee: () => void;
  endBattle: () => void;
  buyShopItem: (itemId: string) => void;
  setActiveView: (v: ActiveView) => void;
  setSelectedPet: (id: string | null) => void;
  setShowBattleSetup: (v: boolean) => void;
  dismissNotification: (id: string) => void;
  addNotification: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const STARTER_SPECIES = ['aquapup', 'firefoxen', 'leafbear'];

const { buildings: initBuildings, plots: initPlots } = createInitialBuildings(createInitialPlots());

const starterPet = createPet(STARTER_SPECIES[Math.floor(Math.random() * STARTER_SPECIES.length)], 1);

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gold: 500,
      gems: 30,
      food: 30,
      speedups: 0,
      pets: [starterPet],
      discoveredSpecies: [starterPet.speciesId],
      plots: initPlots,
      buildings: initBuildings,
      activeTeam: [starterPet.id],
      breedingTasks: [],
      battle: null,
      battlesWon: 0,
      ownedSkins: [],
      lastTick: Date.now(),
      lastGardenTick: Date.now(),
      lastGemTick: Date.now(),
      activeView: 'base',
      selectedPetId: null,
      showBattleSetup: false,
      notifications: [],

      addNotification(message, type = 'info') {
        const id = `notif_${Date.now()}`;
        set(s => ({ notifications: [...s.notifications.slice(-4), { id, message, type }] }));
        setTimeout(() => get().dismissNotification(id), 3500);
      },

      dismissNotification(id) {
        set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
      },

      gameTick() {
        const { pets, food, buildings, breedingTasks, lastTick, lastGardenTick, lastGemTick } = get();
        const now = Date.now();
        const elapsed = now - lastTick;
        const gardenElapsed = now - lastGardenTick;
        const gemElapsed = now - lastGemTick;

        // Pet needs decay (1 unit per 45s for hunger, 60s happiness, 90s energy)
        const hungerDecay = elapsed / 45000;
        const happyDecay = elapsed / 60000;
        const energyDecay = elapsed / 90000;

        const updatedPets = pets.map(pet => {
          if (pet.stage === 'egg') return pet;
          const newHunger = Math.max(0, pet.needs.hunger - hungerDecay);
          const newHappy = Math.max(0, pet.needs.happiness - happyDecay);
          const newEnergy = Math.max(0, pet.needs.energy - energyDecay);
          // Starving reduces HP
          const hpLoss = newHunger === 0 ? 1 : 0;
          // Rolling care score: slowly drifts toward current needs quality (~10 min to fully shift)
          const needsQuality = (newHunger + newHappy) / 2;
          const newCareScore = Math.min(100, Math.max(0,
            (pet.careScore ?? 80) * 0.9985 + needsQuality * 0.0015
          ));
          return {
            ...pet,
            careScore: newCareScore,
            needs: { hunger: newHunger, happiness: newHappy, energy: newEnergy },
            stats: {
              ...pet.stats,
              hp: Math.max(1, pet.stats.hp - hpLoss),
            },
          };
        });

        // Garden food production
        const gardenBuildings = buildings.filter(b => b.type === 'garden');
        const foodPerSecond = gardenBuildings.reduce((acc, b) => acc + b.level / 60, 0);
        const newFood = Math.min(999, food + foodPerSecond * (gardenElapsed / 1000));

        // Gem mine production
        const gemMines = buildings.filter(b => b.type === 'gem_mine');
        const gemsPerSecond = gemMines.reduce((acc, b) => acc + b.level / 300, 0);
        const gemDelta = gemsPerSecond * (gemElapsed / 1000);

        // Check completed breeding tasks
        const updatedTasks = breedingTasks.map(task => {
          if (!task.completed && now >= task.startTime + task.duration) {
            return { ...task, completed: true };
          }
          return task;
        });
        const newlyCompleted = updatedTasks.filter(
          (t, i) => t.completed && !breedingTasks[i]?.completed
        );
        if (newlyCompleted.length > 0) {
          get().addNotification(`Breeding complete! Collect your new pet 💕`, 'success');
        }

        set(s => ({
          pets: updatedPets,
          food: newFood,
          gems: s.gems + gemDelta,
          breedingTasks: updatedTasks,
          lastTick: now,
          lastGardenTick: now,
          lastGemTick: now,
        }));
      },

      feedPet(petId) {
        const { pets, food } = get();
        const pet = pets.find(p => p.id === petId);
        if (!pet) return;
        if (food < 1) { get().addNotification('Not enough food! Buy more in the shop.', 'warning'); return; }
        const xpGain = 5;
        const newXp = pet.xp + xpGain;
        const levelUp = newXp >= pet.xpToNext;
        const newLevel = levelUp ? pet.level + 1 : pet.level;
        const newStage = getStageForLevel(newLevel) as EvolutionStage;
        const evolved = newStage !== pet.stage;

        set(s => ({
          food: Math.max(0, s.food - 1),
          pets: s.pets.map(p => p.id === petId ? {
            ...p,
            needs: { ...p.needs, hunger: Math.min(100, p.needs.hunger + 25) },
            xp: levelUp ? 0 : newXp,
            xpToNext: levelUp ? calcXpToNext(newLevel) : p.xpToNext,
            level: newLevel,
            stage: newStage,
            evolutionVariant: evolved && newStage !== 'egg'
              ? ((p.careScore ?? 80) >= 72 ? 'stellar' : (p.careScore ?? 80) >= 38 ? 'normal' : 'feral') as EvolutionVariant
              : p.evolutionVariant,
            stats: evolved ? {
              ...p.stats,
              maxHp: Math.round(SPECIES_MAP[p.speciesId].baseStats.hp * (1 + (newLevel - 1) * 0.1)),
              hp: Math.round(SPECIES_MAP[p.speciesId].baseStats.hp * (1 + (newLevel - 1) * 0.1)),
              attack: Math.round(SPECIES_MAP[p.speciesId].baseStats.attack * (1 + (newLevel - 1) * 0.1)),
              defense: Math.round(SPECIES_MAP[p.speciesId].baseStats.defense * (1 + (newLevel - 1) * 0.1)),
              speed: Math.round(SPECIES_MAP[p.speciesId].baseStats.speed * (1 + (newLevel - 1) * 0.1)),
            } : p.stats,
          } : p),
        }));
        if (evolved) {
          const variant = pet.careScore !== undefined
            ? (pet.careScore >= 72 ? '⭐ Stellar' : pet.careScore >= 38 ? '' : '💢 Feral')
            : '';
          get().addNotification(`${pet.nickname} evolved into ${variant ? variant + ' ' : ''}${newStage}! 🎉`, 'success');
        }
        if (levelUp && !evolved) get().addNotification(`${pet.nickname} leveled up to ${newLevel}!`, 'success');
      },

      playWithPet(petId) {
        const { pets } = get();
        const pet = pets.find(p => p.id === petId);
        if (!pet) return;
        if (pet.needs.energy < 10) { get().addNotification(`${pet.nickname} is too tired to play!`, 'warning'); return; }
        const xpGain = 10;
        const newXp = pet.xp + xpGain;
        const levelUp = newXp >= pet.xpToNext;
        const newLevel = levelUp ? pet.level + 1 : pet.level;
        const newStage = getStageForLevel(newLevel) as EvolutionStage;
        const evolved = newStage !== pet.stage;

        set(s => ({
          gold: s.gold + 5,
          pets: s.pets.map(p => p.id === petId ? {
            ...p,
            needs: {
              ...p.needs,
              happiness: Math.min(100, p.needs.happiness + 20),
              energy: Math.max(0, p.needs.energy - 15),
            },
            xp: levelUp ? 0 : newXp,
            xpToNext: levelUp ? calcXpToNext(newLevel) : p.xpToNext,
            level: newLevel,
            stage: newStage,
            evolutionVariant: evolved && newStage !== 'egg'
              ? ((p.careScore ?? 80) >= 72 ? 'stellar' : (p.careScore ?? 80) >= 38 ? 'normal' : 'feral') as EvolutionVariant
              : p.evolutionVariant,
          } : p),
        }));
        if (levelUp && !evolved) get().addNotification(`${pet.nickname} leveled up to ${newLevel}! 🎉`, 'success');
        if (evolved) get().addNotification(`${pet.nickname} evolved into ${newStage}! 🎉`, 'success');
      },

      restPet(petId) {
        set(s => ({
          pets: s.pets.map(p => p.id === petId ? {
            ...p,
            needs: { ...p.needs, energy: Math.min(100, p.needs.energy + 40) },
            stats: { ...p.stats, hp: Math.min(p.stats.maxHp, p.stats.hp + Math.round(p.stats.maxHp * 0.3)) },
          } : p),
        }));
      },

      renamePet(petId, name) {
        set(s => ({ pets: s.pets.map(p => p.id === petId ? { ...p, nickname: name } : p) }));
      },

      addToTeam(petId) {
        const { activeTeam } = get();
        if (activeTeam.includes(petId)) return;
        if (activeTeam.length >= 3) { get().addNotification('Team is full! Remove a pet first.', 'warning'); return; }
        set(s => ({
          activeTeam: [...s.activeTeam, petId],
          pets: s.pets.map(p => p.id === petId ? { ...p, isInTeam: true } : p),
        }));
      },

      removeFromTeam(petId) {
        set(s => ({
          activeTeam: s.activeTeam.filter(id => id !== petId),
          pets: s.pets.map(p => p.id === petId ? { ...p, isInTeam: false } : p),
        }));
      },

      unlockPlot(plotId) {
        const { plots, gold, gems } = get();
        const plot = plots.find(p => p.id === plotId);
        if (!plot || plot.unlocked) return;
        if (gold < plot.unlockCost.gold || gems < plot.unlockCost.gems) {
          get().addNotification('Not enough resources to unlock this plot!', 'warning');
          return;
        }
        set(s => ({
          gold: s.gold - plot.unlockCost.gold,
          gems: s.gems - plot.unlockCost.gems,
          plots: s.plots.map(p => p.id === plotId ? { ...p, unlocked: true } : p),
        }));
        get().addNotification('New plot unlocked! 🏗️', 'success');
      },

      buildOnPlot(plotId, type) {
        const { plots, gold, gems, buildings } = get();
        const plot = plots.find(p => p.id === plotId);
        if (!plot || !plot.unlocked || plot.buildingId) return;
        const def = BUILDING_DEFS[type];
        if (gold < def.baseCost.gold || gems < def.baseCost.gems) {
          get().addNotification('Not enough resources!', 'warning');
          return;
        }
        const newBuilding: PlacedBuilding = { id: newBuildingId(), type, level: 1, plotId };
        set(s => ({
          gold: s.gold - def.baseCost.gold,
          gems: s.gems - def.baseCost.gems,
          buildings: [...s.buildings, newBuilding],
          plots: s.plots.map(p => p.id === plotId ? { ...p, buildingId: newBuilding.id } : p),
        }));
        get().addNotification(`${def.name} built! ${def.emoji}`, 'success');
      },

      upgradeBuilding(buildingId) {
        const { buildings, gold, gems } = get();
        const building = buildings.find(b => b.id === buildingId);
        if (!building) return;
        const def = BUILDING_DEFS[building.type];
        const cost = {
          gold: def.upgradeCost.gold * building.level,
          gems: def.upgradeCost.gems * building.level,
        };
        if (gold < cost.gold || gems < cost.gems) {
          get().addNotification('Not enough resources to upgrade!', 'warning');
          return;
        }
        set(s => ({
          gold: s.gold - cost.gold,
          gems: s.gems - cost.gems,
          buildings: s.buildings.map(b => b.id === buildingId ? { ...b, level: b.level + 1 } : b),
        }));
        get().addNotification(`${def.name} upgraded to level ${building.level + 1}! ⬆️`, 'success');
      },

      startBreeding(pet1Id, pet2Id) {
        const { pets, buildings } = get();
        const pet1 = pets.find(p => p.id === pet1Id);
        const pet2 = pets.find(p => p.id === pet2Id);
        if (!pet1 || !pet2) return;
        if (pet1.isBreeding || pet2.isBreeding) { get().addNotification('One of these pets is already breeding!', 'warning'); return; }
        if (pet1.needs.energy < 20 || pet2.needs.energy < 20) { get().addNotification('Pets need more energy to breed!', 'warning'); return; }

        const den = buildings.find(b => b.type === 'breeding_den');
        if (!den) { get().addNotification('Build a Breeding Den first! 💕', 'warning'); return; }

        const baseDuration = 120000; // 2 min
        const reductionPerLevel = 0.15;
        const duration = baseDuration * Math.pow(1 - reductionPerLevel, den.level - 1);
        const resultSpeciesId = pickBreedResult(pet1.speciesId, pet2.speciesId);
        const task: BreedingTask = {
          id: `breed_${Date.now()}`,
          parent1Id: pet1Id,
          parent2Id: pet2Id,
          startTime: Date.now(),
          duration,
          resultSpeciesId,
          completed: false,
        };
        set(s => ({
          breedingTasks: [...s.breedingTasks, task],
          pets: s.pets.map(p => (p.id === pet1Id || p.id === pet2Id) ? { ...p, isBreeding: true } : p),
        }));
        get().addNotification(`Breeding started! Check back in ${Math.round(duration / 60000)} min 💕`, 'info');
      },

      collectBreeding(taskId) {
        const { breedingTasks, pets } = get();
        const task = breedingTasks.find(t => t.id === taskId);
        if (!task || !task.completed) return;
        const newPet = createPet(task.resultSpeciesId, 1);
        const species = SPECIES_MAP[task.resultSpeciesId];

        set(s => ({
          pets: [
            ...s.pets.map(p =>
              (p.id === task.parent1Id || p.id === task.parent2Id) ? {
                ...p, isBreeding: false,
                xp: p.xp + 20,
              } : p
            ),
            newPet,
          ],
          discoveredSpecies: s.discoveredSpecies.includes(task.resultSpeciesId)
            ? s.discoveredSpecies
            : [...s.discoveredSpecies, task.resultSpeciesId],
          breedingTasks: s.breedingTasks.filter(t => t.id !== taskId),
        }));
        get().addNotification(`A new ${species.name} has been born! 🐣`, 'success');
      },

      speedupBreeding(taskId) {
        const { breedingTasks, speedups } = get();
        const task = breedingTasks.find(t => t.id === taskId);
        if (!task || task.completed || speedups < 1) {
          get().addNotification('No speed-ups available!', 'warning');
          return;
        }
        set(s => ({
          speedups: s.speedups - 1,
          breedingTasks: s.breedingTasks.map(t =>
            t.id === taskId ? { ...t, startTime: t.startTime - 1800000 } : t
          ),
        }));
        get().addNotification('Speed-up applied! ⏩', 'success');
      },

      startBattle() {
        const { activeTeam, pets, battlesWon } = get();
        if (activeTeam.length === 0) { get().addNotification('Add pets to your team first!', 'warning'); return; }
        const arena = get().buildings.find(b => b.type === 'arena');
        if (!arena) { get().addNotification('Build an Arena first! ⚔️', 'warning'); return; }

        const round = battlesWon + 1;
        const enemies = generateEnemyTeam(round);
        const playerHps: Record<string, number> = {};
        activeTeam.forEach(id => {
          const p = pets.find(pet => pet.id === id);
          if (p) playerHps[id] = p.stats.hp;
        });
        const enemyHps: Record<string, number> = {};
        enemies.forEach(e => { enemyHps[e.id] = e.stats.hp; });

        const goldReward = 100 + round * 50;
        const xpReward = 50 + round * 25;

        set({
          battle: {
            playerTeam: activeTeam,
            enemies,
            playerIndex: 0,
            enemyIndex: 0,
            playerHps,
            enemyHps,
            turn: 'player',
            log: [`⚔️ Battle started! Round ${round} - Fight!`],
            result: null,
            goldReward,
            xpReward,
            round,
          },
          showBattleSetup: false,
        });
      },

      performAttack() {
        const { battle, pets } = get();
        if (!battle || battle.turn !== 'player' || battle.result) return;

        const attackerId = battle.playerTeam[battle.playerIndex];
        const attacker = pets.find(p => p.id === attackerId);
        const defender = battle.enemies[battle.enemyIndex];
        if (!attacker || !defender) return;

        const attackerSpecies = SPECIES_MAP[attacker.speciesId];
        const defenderSpecies = SPECIES_MAP[defender.speciesId];
        const typeBonus = getTypeAdvantage(attackerSpecies.type, defenderSpecies.type);
        const baseDmg = Math.max(1, attacker.stats.attack - defender.stats.defense / 2);
        const dmg = Math.round(baseDmg * typeBonus * (0.85 + Math.random() * 0.3));

        const newEnemyHp = Math.max(0, (battle.enemyHps[defender.id] ?? defender.stats.hp) - dmg);
        const typeLine = typeBonus > 1 ? ' Super effective! 🔥' : typeBonus < 1 ? ' Not very effective...' : '';
        const log = [...battle.log, `${attacker.nickname} attacks for ${dmg} dmg!${typeLine}`];
        const newEnemyHps = { ...battle.enemyHps, [defender.id]: newEnemyHp };

        if (newEnemyHp <= 0) {
          // Enemy fainted
          log.push(`${defender.name} fainted! 💀`);
          const nextEnemyIndex = battle.enemyIndex + 1;
          if (nextEnemyIndex >= battle.enemies.length) {
            // Player wins!
            log.push(`🏆 Victory! You won ${battle.goldReward} gold and ${battle.xpReward} XP!`);
            set(s => ({
              gold: s.gold + battle.goldReward,
              battlesWon: s.battlesWon + 1,
              pets: s.pets.map(p =>
                battle.playerTeam.includes(p.id) ? {
                  ...p,
                  xp: p.xp + battle.xpReward,
                  level: p.xp + battle.xpReward >= p.xpToNext ? p.level + 1 : p.level,
                  xpToNext: p.xp + battle.xpReward >= p.xpToNext ? calcXpToNext(p.level + 1) : p.xpToNext,
                  stage: getStageForLevel(p.xp + battle.xpReward >= p.xpToNext ? p.level + 1 : p.level) as EvolutionStage,
                } : p
              ),
              battle: { ...battle, enemyHps: newEnemyHps, log, result: 'win', turn: 'done' },
            }));
            return;
          }
          set(s => ({ battle: s.battle ? { ...s.battle, enemyHps: newEnemyHps, enemyIndex: nextEnemyIndex, log, turn: 'enemy' } : null }));
        } else {
          set(s => ({ battle: s.battle ? { ...s.battle, enemyHps: newEnemyHps, log, turn: 'enemy' } : null }));
        }

        // Enemy turn
        setTimeout(() => {
          const { battle: currentBattle, pets: currentPets } = get();
          if (!currentBattle || currentBattle.turn !== 'enemy' || currentBattle.result) return;

          const enemy = currentBattle.enemies[currentBattle.enemyIndex];
          const defId = currentBattle.playerTeam[currentBattle.playerIndex];
          const def = currentPets.find(p => p.id === defId);
          if (!enemy || !def) return;

          const atkSpecies = SPECIES_MAP[enemy.speciesId];
          const defSpecies = SPECIES_MAP[def.speciesId];
          const tb = getTypeAdvantage(atkSpecies.type, defSpecies.type);
          const eDmg = Math.max(1, Math.round((enemy.stats.attack - def.stats.defense / 2) * tb * (0.85 + Math.random() * 0.3)));
          const newPlayerHp = Math.max(0, (currentBattle.playerHps[defId] ?? def.stats.hp) - eDmg);
          const eTl = tb > 1 ? ' Super effective! 🔥' : tb < 1 ? ' Not very effective...' : '';
          const elog = [...currentBattle.log, `${enemy.name} attacks ${def.nickname} for ${eDmg} dmg!${eTl}`];
          const newPlayerHps = { ...currentBattle.playerHps, [defId]: newPlayerHp };

          if (newPlayerHp <= 0) {
            elog.push(`${def.nickname} fainted! 💀`);
            const nextPlayerIndex = currentBattle.playerIndex + 1;
            if (nextPlayerIndex >= currentBattle.playerTeam.length) {
              elog.push('💔 Defeat! Your team has been wiped out...');
              set(s => ({ battle: s.battle ? { ...s.battle, playerHps: newPlayerHps, log: elog, result: 'lose', turn: 'done' } : null }));
              return;
            }
            set(s => ({ battle: s.battle ? { ...s.battle, playerHps: newPlayerHps, playerIndex: nextPlayerIndex, log: elog, turn: 'player' } : null }));
          } else {
            set(s => ({ battle: s.battle ? { ...s.battle, playerHps: newPlayerHps, log: elog, turn: 'player' } : null }));
          }
        }, 1000);
      },

      performSpecial() {
        const { battle, pets } = get();
        if (!battle || battle.turn !== 'player' || battle.result) return;

        const attackerId = battle.playerTeam[battle.playerIndex];
        const attacker = pets.find(p => p.id === attackerId);
        const defender = battle.enemies[battle.enemyIndex];
        if (!attacker || !defender) return;

        const species = SPECIES_MAP[attacker.speciesId];
        const typeBonus = getTypeAdvantage(species.type, SPECIES_MAP[defender.speciesId].type);
        // Special: 1.5x power but uses more energy
        const baseDmg = Math.max(1, attacker.stats.attack * 1.5 - defender.stats.defense / 3);
        const dmg = Math.round(baseDmg * typeBonus * (0.9 + Math.random() * 0.2));
        const newEnemyHp = Math.max(0, (battle.enemyHps[defender.id] ?? defender.stats.hp) - dmg);
        const log = [...battle.log, `✨ ${attacker.nickname} uses ${species.type} special for ${dmg} dmg!`];
        const newEnemyHps = { ...battle.enemyHps, [defender.id]: newEnemyHp };

        if (newEnemyHp <= 0) {
          log.push(`${defender.name} fainted! 💀`);
          const nextEnemyIndex = battle.enemyIndex + 1;
          if (nextEnemyIndex >= battle.enemies.length) {
            log.push(`🏆 Victory! You won ${battle.goldReward} gold!`);
            set(s => ({
              gold: s.gold + battle.goldReward,
              battlesWon: s.battlesWon + 1,
              battle: { ...battle, enemyHps: newEnemyHps, log, result: 'win', turn: 'done' },
            }));
            return;
          }
          set(s => ({ battle: s.battle ? { ...s.battle, enemyHps: newEnemyHps, enemyIndex: nextEnemyIndex, log, turn: 'enemy' } : null }));
        } else {
          set(s => ({ battle: s.battle ? { ...s.battle, enemyHps: newEnemyHps, log, turn: 'enemy' } : null }));
        }

        setTimeout(() => get().performAttack(), 800);
      },

      performFlee() {
        set(s => ({ battle: s.battle ? { ...s.battle, result: 'lose', turn: 'done', log: [...(s.battle?.log ?? []), '🏃 You fled the battle!'] } : null }));
      },

      endBattle() {
        set({ battle: null });
      },

      buyShopItem(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return;
        const { gold, gems } = get();

        if (item.cost.real) {
          get().addNotification('💳 This would open the payment flow in the live app!', 'info');
          // Simulate giving gems for demo
          set(s => ({ gems: s.gems + (item.value as number) }));
          get().addNotification(`+${item.value} 💎 gems added (demo mode)`, 'success');
          return;
        }

        if (item.cost.gold && gold < item.cost.gold) { get().addNotification('Not enough gold!', 'warning'); return; }
        if (item.cost.gems && gems < item.cost.gems) { get().addNotification('Not enough gems!', 'warning'); return; }

        set(s => ({
          gold: item.cost.gold ? s.gold - item.cost.gold : s.gold,
          gems: item.cost.gems ? s.gems - item.cost.gems : s.gems,
        }));

        if (item.category === 'eggs') {
          const rarity = item.value as string;
          const pool = PET_SPECIES.filter(s =>
            rarity === 'common' ? s.rarity === 'common' :
            rarity === 'rare' ? ['uncommon', 'rare'].includes(s.rarity) :
            rarity === 'epic' ? ['rare', 'epic'].includes(s.rarity) :
            ['epic', 'legendary'].includes(s.rarity)
          );
          const species = pool[Math.floor(Math.random() * pool.length)];
          const newPet = createPet(species.id, 1);
          set(s => ({
            pets: [...s.pets, newPet],
            discoveredSpecies: s.discoveredSpecies.includes(species.id)
              ? s.discoveredSpecies
              : [...s.discoveredSpecies, species.id],
          }));
          get().addNotification(`🐣 A ${species.rarity} ${species.name} hatched!`, 'success');
        } else if (item.category === 'food') {
          set(s => ({ food: Math.min(999, s.food + (item.value as number)) }));
          get().addNotification(`+${item.value} food added! 🍖`, 'success');
        } else if (item.category === 'speedups') {
          set(s => ({ speedups: s.speedups + 1 }));
          get().addNotification('Speed-up added to your inventory! ⏩', 'success');
        } else if (item.category === 'skins') {
          const skinId = item.value as string;
          if (get().ownedSkins.includes(skinId)) {
            get().addNotification('You already own this skin pack!', 'warning');
            return;
          }
          set(s => ({ ownedSkins: [...s.ownedSkins, skinId] }));
          get().addNotification(`${item.name} unlocked for all your pets! 🎨`, 'success');
        }
      },

      setActiveView(v) { set({ activeView: v }); },
      setSelectedPet(id) { set({ selectedPetId: id }); },
      setShowBattleSetup(v) { set({ showBattleSetup: v }); },
    }),
    {
      name: 'pet-realm-save',
      partialize: (s) => ({
        gold: s.gold, gems: s.gems, food: s.food, speedups: s.speedups,
        pets: s.pets, discoveredSpecies: s.discoveredSpecies,
        plots: s.plots, buildings: s.buildings,
        activeTeam: s.activeTeam, breedingTasks: s.breedingTasks,
        battlesWon: s.battlesWon, ownedSkins: s.ownedSkins,
        lastTick: s.lastTick, lastGardenTick: s.lastGardenTick, lastGemTick: s.lastGemTick,
      }),
    }
  )
);
