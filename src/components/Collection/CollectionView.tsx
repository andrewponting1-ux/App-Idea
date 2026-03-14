import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Pet } from '../../types';
import { SPECIES_MAP, TYPE_COLORS, TYPE_ICONS, RARITY_COLORS, PET_SPECIES } from '../../data/petSpecies';
import PetDetailView from '../PetCare/PetDetailView';
import PetSprite from '../UI/PetSprite';

const RARITY_GLOW_CLASS: Record<string, string> = {
  common:    '',
  uncommon:  '',
  rare:      'glow-rare',
  epic:      'glow-epic',
  legendary: 'glow-legendary',
};

const RARITY_BORDER: Record<string, string> = {
  common:    '#4a4a4a',
  uncommon:  '#22a855',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#f5a623',
};

const STAGE_BADGE: Record<string, { label: string; color: string }> = {
  egg:   { label: 'Egg',   color: '#9ca3af' },
  baby:  { label: 'Baby',  color: '#22c55e' },
  teen:  { label: 'Teen',  color: '#3b82f6' },
  adult: { label: 'Adult', color: '#f5a623' },
  elder: { label: 'Elder', color: '#a855f7' },
};

function NeedsBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #3a2a10' }}>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function PetCard({ pet, onSelect }: { pet: Pet; onSelect: () => void }) {
  const species = SPECIES_MAP[pet.speciesId];
  const isLow = pet.needs.hunger < 25 || pet.needs.happiness < 25;
  const rarity = species?.rarity ?? 'common';
  const stageBadge = STAGE_BADGE[pet.stage] ?? STAGE_BADGE.adult;

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center p-2.5 transition-all active:scale-95 ${RARITY_GLOW_CLASS[rarity]}`}
      style={{
        background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
        border: `2px solid ${RARITY_BORDER[rarity]}`,
        borderRadius: 14,
        boxShadow: isLow
          ? `0 0 10px rgba(239,68,68,0.4), inset 0 1px 0 rgba(200,150,60,0.1)`
          : 'inset 0 1px 0 rgba(200,150,60,0.1)',
      }}
    >
      {/* Sprite area with level badge + indicators */}
      <div className="relative flex items-center justify-center mb-1" style={{ width: 80, height: 80 }}>
        {/* Level badge top-left */}
        <div
          className="absolute top-0 left-0 z-10 text-[9px] font-black px-1.5 py-0.5 rounded-full"
          style={{ background: '#f5a623', color: '#1a0a00', boxShadow: '0 1px 0 #8a4a00' }}
        >
          {pet.level}
        </div>

        <PetSprite speciesId={pet.speciesId} stage={pet.stage} variant={pet.evolutionVariant} size={80} state="idle" />

        {pet.isInTeam && (
          <span className="absolute -top-1 -right-1 text-xs">⚔️</span>
        )}
        {pet.isBreeding && (
          <span className="absolute -top-1 -right-1 text-xs">💕</span>
        )}
        {isLow && !pet.isBreeding && (
          <span className="absolute -bottom-1 -right-1 text-xs animate-bounce-slow">⚠️</span>
        )}
      </div>

      {/* Name */}
      <div className="w-full text-center mb-1">
        <div className="text-xs font-bold text-white truncate">{pet.nickname}</div>
      </div>

      {/* Type + Stage badges */}
      <div className="flex items-center gap-1 mb-1.5 flex-wrap justify-center">
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${TYPE_COLORS[species?.type ?? 'fire']}`}>
          {TYPE_ICONS[species?.type ?? 'fire']}
        </span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
          style={{ color: stageBadge.color, background: 'rgba(0,0,0,0.3)', border: `1px solid ${stageBadge.color}50` }}
        >
          {stageBadge.label}
        </span>
      </div>

      {/* Needs bars */}
      <div className="w-full space-y-1">
        <NeedsBar value={pet.needs.hunger}    color={pet.needs.hunger    < 25 ? 'bg-red-500' : 'bg-yellow-500'} />
        <NeedsBar value={pet.needs.happiness} color={pet.needs.happiness < 25 ? 'bg-red-500' : 'bg-pink-500'} />
        <NeedsBar value={pet.needs.energy}    color={pet.needs.energy    < 25 ? 'bg-red-500' : 'bg-blue-500'} />
      </div>
    </button>
  );
}

function PokedexEntry({ speciesId, discovered }: { speciesId: string; discovered: boolean }) {
  const species = SPECIES_MAP[speciesId];
  if (!species) return null;
  const glowClass = discovered ? RARITY_GLOW_CLASS[species.rarity] : '';
  const border = discovered ? RARITY_BORDER[species.rarity] : '#3a2808';

  return (
    <div
      className={`flex flex-col items-center p-2 transition-all ${glowClass} ${!discovered ? 'opacity-45' : ''}`}
      style={{
        background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
        border: `2px solid ${border}`,
        borderRadius: 14,
        boxShadow: 'inset 0 1px 0 rgba(200,150,60,0.08)',
      }}
    >
      <div
        className="flex items-center justify-center mb-1"
        style={{ width: 70, height: 70, filter: discovered ? 'none' : 'grayscale(1) brightness(0.25)' }}
      >
        {discovered
          ? <PetSprite speciesId={speciesId} stage="adult" size={70} state="idle" />
          : <span className="text-3xl">❓</span>
        }
      </div>
      <div className="text-[10px] font-bold text-white text-center mb-0.5">
        {discovered ? species.name : '???'}
      </div>
      {discovered && (
        <>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${TYPE_COLORS[species.type]}`}>
            {TYPE_ICONS[species.type]}
          </span>
          <span
            className="text-[9px] font-bold mt-0.5"
            style={{ color: RARITY_BORDER[species.rarity] }}
          >
            {species.rarity}
          </span>
        </>
      )}
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
      <div
        className="flex p-1 mx-4 mt-4 rounded-xl gap-1"
        style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid #3a2808' }}
      >
        {(['mypets', 'pokedex'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
              tab === t ? 'text-white' : 'text-gray-400'
            }`}
            style={tab === t ? {
              background: 'linear-gradient(to bottom, #e8a030, #b06010)',
              boxShadow: '0 2px 0 #6a3000',
            } : {}}
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
                className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition"
                style={filter === t ? {
                  background: 'linear-gradient(to bottom, #e8a030, #b06010)',
                  color: 'white',
                  border: '1px solid #8a4a00',
                  boxShadow: '0 2px 0 #6a3000',
                } : {
                  background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
                  color: '#9ca3af',
                  border: '1px solid #6b4f1a',
                }}
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
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              {filteredPets.map(pet => (
                <PetCard key={pet.id} pet={pet} onSelect={() => setSelectedPet(pet.id)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 py-3 pb-4">
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
