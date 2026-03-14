import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SPECIES_MAP, TYPE_COLORS, TYPE_ICONS, RARITY_COLORS } from '../../data/petSpecies';
import PetSprite from '../UI/PetSprite';

interface Props { petId: string; }

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{value}/{max}</span>
      </div>
      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function NeedBar({ label, value, emoji, color }: { label: string; value: number; emoji: string; color: string }) {
  const low = value < 25;
  return (
    <div className={`bg-black/30 rounded-xl p-3 border ${low ? 'border-red-500/40' : 'border-game-border'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 flex items-center gap-1">{emoji} {label}</span>
        <span className={`text-xs font-bold ${low ? 'text-red-400' : 'text-white'}`}>{Math.round(value)}%</span>
      </div>
      <div className="h-3 bg-black/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${low ? 'animate-pulse' : ''} ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {low && <p className="text-[10px] text-red-400 mt-1">⚠️ Needs attention!</p>}
    </div>
  );
}

export default function PetDetailView({ petId }: Props) {
  const pet = useGameStore(s => s.pets.find(p => p.id === petId));
  const food = useGameStore(s => s.food);
  const activeTeam = useGameStore(s => s.activeTeam);
  const feedPet = useGameStore(s => s.feedPet);
  const playWithPet = useGameStore(s => s.playWithPet);
  const restPet = useGameStore(s => s.restPet);
  const addToTeam = useGameStore(s => s.addToTeam);
  const removeFromTeam = useGameStore(s => s.removeFromTeam);
  const setSelectedPet = useGameStore(s => s.setSelectedPet);
  const renamePet = useGameStore(s => s.renamePet);

  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState('');

  if (!pet) return null;

  const species = SPECIES_MAP[pet.speciesId];
  const isInTeam = activeTeam.includes(petId);
  const xpPct = Math.round((pet.xp / pet.xpToNext) * 100);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => setSelectedPet(null)}
          className="text-gray-400 hover:text-white transition text-xl"
        >
          ←
        </button>
        <h2 className="text-lg font-bold text-white flex-1">
          {renaming ? (
            <div className="flex gap-2">
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="flex-1 bg-black/40 border border-violet-500 rounded-lg px-2 py-0.5 text-sm text-white outline-none"
                maxLength={20}
                autoFocus
              />
              <button
                onClick={() => { renamePet(petId, nameInput || pet.nickname); setRenaming(false); }}
                className="text-xs bg-violet-600 text-white px-2 py-1 rounded-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <span onClick={() => { setRenaming(true); setNameInput(pet.nickname); }} className="cursor-pointer">
              {pet.nickname} ✏️
            </span>
          )}
        </h2>
      </div>

      {/* Pet display */}
      <div className="mx-4 mb-4">
        <div className={`bg-game-card border-2 rounded-2xl p-6 flex flex-col items-center ${RARITY_COLORS[species.rarity]}`}>
          <div className="mb-2">
            <PetSprite speciesId={pet.speciesId} stage={pet.stage} variant={pet.evolutionVariant} size={130} state="idle" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[species.type]}`}>
              {TYPE_ICONS[species.type]} {species.type}
            </span>
            <span className={`text-xs font-bold ${RARITY_COLORS[species.rarity].split(' ')[0]}`}>
              {species.rarity}
            </span>
            <span className="text-xs text-gray-400">{pet.stage}</span>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2 italic">{species.flavorText}</p>

          {/* Level & XP */}
          <div className="w-full mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-violet-400 font-bold">Level {pet.level}</span>
              <span className="text-gray-400">{pet.xp}/{pet.xpToNext} XP</span>
            </div>
            <div className="h-2.5 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Needs */}
      <div className="px-4 mb-4 space-y-2">
        <h3 className="text-sm font-bold text-gray-300">Needs</h3>
        <NeedBar label="Hunger" value={pet.needs.hunger} emoji="🍖" color="bg-yellow-500" />
        <NeedBar label="Happiness" value={pet.needs.happiness} emoji="😊" color="bg-pink-500" />
        <NeedBar label="Energy" value={pet.needs.energy} emoji="⚡" color="bg-blue-500" />
      </div>

      {/* Actions */}
      <div className="px-4 mb-4 grid grid-cols-3 gap-2">
        <ActionBtn
          emoji="🍖"
          label="Feed"
          sub={`${Math.floor(food)} food`}
          disabled={food < 1}
          onClick={() => feedPet(petId)}
          color="bg-yellow-600 hover:bg-yellow-500"
        />
        <ActionBtn
          emoji="🎮"
          label="Play"
          sub="-15 energy"
          disabled={pet.needs.energy < 10}
          onClick={() => playWithPet(petId)}
          color="bg-pink-600 hover:bg-pink-500"
        />
        <ActionBtn
          emoji="😴"
          label="Rest"
          sub="+40 energy"
          disabled={false}
          onClick={() => restPet(petId)}
          color="bg-blue-600 hover:bg-blue-500"
        />
      </div>

      {/* Battle stats */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-bold text-gray-300 mb-2">Battle Stats</h3>
        <div className="bg-game-card border border-game-border rounded-xl p-3 space-y-2">
          <StatBar label="HP" value={pet.stats.hp} max={pet.stats.maxHp} color="bg-green-500" />
          <StatBar label="Attack" value={pet.stats.attack} max={200} color="bg-red-500" />
          <StatBar label="Defense" value={pet.stats.defense} max={200} color="bg-blue-500" />
          <StatBar label="Speed" value={pet.stats.speed} max={200} color="bg-yellow-500" />
        </div>
      </div>

      {/* Team button */}
      <div className="px-4 mb-6">
        {isInTeam ? (
          <button
            onClick={() => removeFromTeam(petId)}
            className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition"
          >
            Remove from Team ⚔️
          </button>
        ) : (
          <button
            onClick={() => addToTeam(petId)}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition"
          >
            Add to Team ⚔️
          </button>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  emoji, label, sub, disabled, onClick, color
}: {
  emoji: string; label: string; sub: string;
  disabled: boolean; onClick: () => void; color: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-3 rounded-xl font-bold text-white transition active:scale-95 ${
        disabled ? 'bg-gray-700 opacity-50 cursor-not-allowed' : color
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs">{label}</span>
      <span className="text-[9px] opacity-70">{sub}</span>
    </button>
  );
}
