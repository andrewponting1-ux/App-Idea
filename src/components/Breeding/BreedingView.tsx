import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SPECIES_MAP, TYPE_COLORS, TYPE_ICONS } from '../../data/petSpecies';
import { Pet } from '../../types';

function msToTime(ms: number): string {
  if (ms <= 0) return 'Ready!';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function PetPickerCard({ pet, selected, onSelect, disabled }: {
  pet: Pet; selected: boolean; disabled: boolean; onSelect: () => void;
}) {
  const species = SPECIES_MAP[pet.speciesId];
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition ${
        disabled ? 'opacity-40 cursor-not-allowed border-gray-700/40 bg-black/20' :
        selected ? 'border-violet-500 bg-violet-900/30' :
        'border-game-border bg-game-card hover:border-violet-400'
      }`}
    >
      <span className="text-2xl">{species?.emojis[pet.stage] ?? '❓'}</span>
      <div className="flex-1 text-left min-w-0">
        <div className="text-xs font-bold text-white truncate">{pet.nickname}</div>
        <div className="flex items-center gap-1">
          <span className={`text-[9px] px-1 rounded ${TYPE_COLORS[species?.type ?? 'fire']}`}>
            {TYPE_ICONS[species?.type ?? 'fire']}
          </span>
          <span className="text-[9px] text-gray-400">Lv{pet.level} • ⚡{Math.round(pet.needs.energy)}%</span>
        </div>
      </div>
      {selected && <span className="text-violet-400 text-sm">✓</span>}
    </button>
  );
}

export default function BreedingView() {
  const pets = useGameStore(s => s.pets);
  const buildings = useGameStore(s => s.buildings);
  const breedingTasks = useGameStore(s => s.breedingTasks);
  const speedups = useGameStore(s => s.speedups);
  const startBreeding = useGameStore(s => s.startBreeding);
  const collectBreeding = useGameStore(s => s.collectBreeding);
  const speedupBreeding = useGameStore(s => s.speedupBreeding);
  const setActiveView = useGameStore(s => s.setActiveView);

  const [pet1Id, setPet1Id] = useState<string | null>(null);
  const [pet2Id, setPet2Id] = useState<string | null>(null);

  const hasDen = buildings.some(b => b.type === 'breeding_den');
  const den = buildings.find(b => b.type === 'breeding_den');

  const availablePets = pets.filter(p => !p.isBreeding && p.stage !== 'egg');
  const now = Date.now();

  function selectPet(id: string) {
    if (pet1Id === id) { setPet1Id(null); return; }
    if (pet2Id === id) { setPet2Id(null); return; }
    if (!pet1Id) { setPet1Id(id); return; }
    if (!pet2Id) { setPet2Id(id); return; }
    setPet1Id(id);
    setPet2Id(null);
  }

  function handleStartBreeding() {
    if (!pet1Id || !pet2Id) return;
    startBreeding(pet1Id, pet2Id);
    setPet1Id(null);
    setPet2Id(null);
  }

  if (!hasDen) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">💕</div>
        <h2 className="text-lg font-bold text-white mb-2">Breeding Den Required</h2>
        <p className="text-sm text-gray-400 mb-4">Build a Breeding Den on your base to start breeding pets.</p>
        <button
          onClick={() => setActiveView('base')}
          className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-6 py-3 rounded-xl transition"
        >
          Go to Base
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="text-lg font-bold text-white mb-1">Breeding Den 💕</h2>
      <div className="text-xs text-gray-400 mb-4">
        Den Level {den?.level ?? 1} • {den ? `-${Math.round((1 - Math.pow(0.85, den.level - 1)) * 100)}% breed time` : ''}
      </div>

      {/* Active breeding tasks */}
      {breedingTasks.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-300 mb-2">Active Breeding</h3>
          <div className="space-y-2">
            {breedingTasks.map(task => {
              const remaining = task.startTime + task.duration - now;
              const isReady = task.completed || remaining <= 0;
              const parent1 = pets.find(p => p.id === task.parent1Id);
              const parent2 = pets.find(p => p.id === task.parent2Id);
              const p1Species = parent1 ? SPECIES_MAP[parent1.speciesId] : null;
              const p2Species = parent2 ? SPECIES_MAP[parent2.speciesId] : null;
              const pct = isReady ? 100 : Math.round(((task.duration - Math.max(0, remaining)) / task.duration) * 100);

              return (
                <div key={task.id} className={`bg-game-card border rounded-xl p-3 ${isReady ? 'border-green-500/50' : 'border-game-border'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{p1Species?.emojis[parent1?.stage ?? 'adult'] ?? '❓'}</span>
                    <span className="text-gray-400">+</span>
                    <span className="text-2xl">{p2Species?.emojis[parent2?.stage ?? 'adult'] ?? '❓'}</span>
                    <div className="flex-1 text-right">
                      <div className={`text-xs font-bold ${isReady ? 'text-green-400' : 'text-gray-300'}`}>
                        {isReady ? '✅ Ready!' : msToTime(remaining)}
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${isReady ? 'bg-green-500' : 'bg-pink-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    {isReady ? (
                      <button
                        onClick={() => collectBreeding(task.id)}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded-lg transition"
                      >
                        🐣 Collect Pet!
                      </button>
                    ) : (
                      <button
                        onClick={() => speedupBreeding(task.id)}
                        disabled={speedups < 1}
                        className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${
                          speedups > 0 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        ⏩ Speed-Up ({speedups})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pair selector */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-300 mb-2">Select a Pair</h3>
        <div className="flex gap-3 mb-3">
          <div className={`flex-1 aspect-square max-h-24 flex flex-col items-center justify-center rounded-xl border-2 ${pet1Id ? 'border-violet-500 bg-violet-900/20' : 'border-dashed border-gray-600'}`}>
            {pet1Id ? (
              <>
                <span className="text-3xl">{SPECIES_MAP[pets.find(p=>p.id===pet1Id)?.speciesId??'']?.emojis[pets.find(p=>p.id===pet1Id)?.stage??'adult']??'❓'}</span>
                <span className="text-[10px] text-gray-400 mt-1">{pets.find(p=>p.id===pet1Id)?.nickname}</span>
              </>
            ) : (
              <span className="text-gray-600 text-3xl">❓</span>
            )}
          </div>
          <div className="flex items-center text-2xl text-pink-400">💕</div>
          <div className={`flex-1 aspect-square max-h-24 flex flex-col items-center justify-center rounded-xl border-2 ${pet2Id ? 'border-violet-500 bg-violet-900/20' : 'border-dashed border-gray-600'}`}>
            {pet2Id ? (
              <>
                <span className="text-3xl">{SPECIES_MAP[pets.find(p=>p.id===pet2Id)?.speciesId??'']?.emojis[pets.find(p=>p.id===pet2Id)?.stage??'adult']??'❓'}</span>
                <span className="text-[10px] text-gray-400 mt-1">{pets.find(p=>p.id===pet2Id)?.nickname}</span>
              </>
            ) : (
              <span className="text-gray-600 text-3xl">❓</span>
            )}
          </div>
        </div>

        <button
          disabled={!pet1Id || !pet2Id}
          onClick={handleStartBreeding}
          className={`w-full py-3 font-bold rounded-xl transition mb-4 ${
            pet1Id && pet2Id
              ? 'bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          💕 Start Breeding
        </button>
      </div>

      {/* Pet list */}
      <h3 className="text-sm font-bold text-gray-300 mb-2">Available Pets ({availablePets.length})</h3>
      {availablePets.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-xs">All pets are currently breeding!</div>
      ) : (
        <div className="space-y-1.5">
          {availablePets.map(pet => (
            <PetPickerCard
              key={pet.id}
              pet={pet}
              selected={pet.id === pet1Id || pet.id === pet2Id}
              disabled={pet.needs.energy < 20}
              onSelect={() => selectPet(pet.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
