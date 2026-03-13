import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Pet } from '../../types';
import { SPECIES_MAP, TYPE_COLORS, TYPE_ICONS, RARITY_COLORS, PET_SPECIES } from '../../data/petSpecies';
import PetDetailView from '../PetCare/PetDetailView';

function NeedsBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function PetCard({ pet, onSelect }: { pet: Pet; onSelect: () => void }) {
  const species = SPECIES_MAP[pet.speciesId];
  const isLow = pet.needs.hunger < 25 || pet.needs.happiness < 25;
  const skinEmoji = species?.emojis[pet.stage] ?? '❓';

  return (
    <button
      onClick={onSelect}
      className={`bg-game-card border rounded-xl p-3 flex flex-col items-center gap-2 transition-all active:scale-95 ${
        RARITY_COLORS[species?.rarity ?? 'common']
      } ${isLow ? 'shadow-red-500/20 shadow-lg' : ''}`}
    >
      {/* Pet emoji with stage indicator */}
      <div className="relative">
        <span className="text-4xl block leading-none">{skinEmoji}</span>
        {pet.isInTeam && (
          <span className="absolute -top-1 -right-1 text-xs">⚔️</span>
        )}
        {pet.isBreeding && (
          <span className="absolute -top-1 -right-1 text-xs">💕</span>
        )}
        {isLow && !pet.isBreeding && (
          <span className="absolute -top-1 -left-1 text-xs animate-bounce-slow">⚠️</span>
        )}
      </div>

      <div className="w-full text-center">
        <div className="text-xs font-bold text-white truncate">{pet.nickname}</div>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span className={`text-[9px] px-1 rounded ${TYPE_COLORS[species?.type ?? 'fire']}`}>
            {TYPE_ICONS[species?.type ?? 'fire']} {species?.type}
          </span>
        </div>
        <div className="text-[9px] text-gray-500 mt-0.5">Lv{pet.level} • {pet.stage}</div>
      </div>

      {/* Mini needs bars */}
      <div className="w-full space-y-0.5">
        <NeedsBar value={pet.needs.hunger} color={pet.needs.hunger < 25 ? 'bg-red-500' : 'bg-yellow-500'} />
        <NeedsBar value={pet.needs.happiness} color={pet.needs.happiness < 25 ? 'bg-red-500' : 'bg-pink-500'} />
        <NeedsBar value={pet.needs.energy} color={pet.needs.energy < 25 ? 'bg-red-500' : 'bg-blue-500'} />
      </div>
    </button>
  );
}

function PokedexEntry({ speciesId, discovered }: { speciesId: string; discovered: boolean }) {
  const species = SPECIES_MAP[speciesId];
  if (!species) return null;
  return (
    <div className={`bg-game-card border rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all ${
      discovered ? RARITY_COLORS[species.rarity] : 'border-gray-700/40 opacity-40'
    }`}>
      <span className="text-3xl">{discovered ? species.emojis.adult : '❓'}</span>
      <div className="text-[10px] font-bold text-white text-center">{discovered ? species.name : '???'}</div>
      {discovered && (
        <span className={`text-[9px] px-1 rounded ${TYPE_COLORS[species.type]}`}>
          {TYPE_ICONS[species.type]} {species.type}
        </span>
      )}
      <span className={`text-[9px] font-semibold ${discovered ? RARITY_COLORS[species.rarity].split(' ')[0] : 'text-gray-600'}`}>
        {discovered ? species.rarity : '???'}
      </span>
    </div>
  );
}

export default function CollectionView() {
  const pets = useGameStore(s => s.pets);
  const discoveredSpecies = useGameStore(s => s.discoveredSpecies);
  const setSelectedPet = useGameStore(s => s.setSelectedPet);
  const selectedPetId = useGameStore(s => s.selectedPetId);

  const [tab, setTab] = useState<'mypets' | 'pokedex'>('mypets');
  const [filter, setFilter] = useState<string>('all');

  if (selectedPetId) {
    return <PetDetailView petId={selectedPetId} />;
  }

  const types = ['all', 'fire', 'water', 'grass', 'electric', 'air', 'rock', 'dark', 'light'];
  const filteredPets = filter === 'all' ? pets : pets.filter(p => SPECIES_MAP[p.speciesId]?.type === filter);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Tab switcher */}
      <div className="flex bg-black/30 p-1 mx-4 mt-4 rounded-xl gap-1">
        {(['mypets', 'pokedex'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
              tab === t ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'mypets' ? `🐾 My Pets (${pets.length})` : `📖 Pokédex (${discoveredSpecies.length}/${PET_SPECIES.length})`}
          </button>
        ))}
      </div>

      {tab === 'mypets' ? (
        <>
          {/* Type filter */}
          <div className="flex gap-1.5 overflow-x-auto px-4 py-3 scrollbar-hide">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition ${
                  filter === t ? 'bg-violet-600 text-white' : 'bg-game-card text-gray-400 border border-game-border'
                }`}
              >
                {t === 'all' ? '✨ All' : `${TYPE_ICONS[t]} ${t}`}
              </button>
            ))}
          </div>

          {filteredPets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">🥚</div>
              <div className="text-sm">No pets here yet!</div>
              <div className="text-xs mt-1">Buy eggs in the shop to start collecting</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 px-4 pb-4">
              {filteredPets.map(pet => (
                <PetCard key={pet.id} pet={pet} onSelect={() => setSelectedPet(pet.id)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 px-4 py-3 pb-4">
          {PET_SPECIES.map(s => (
            <PokedexEntry
              key={s.id}
              speciesId={s.id}
              discovered={discoveredSpecies.includes(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
