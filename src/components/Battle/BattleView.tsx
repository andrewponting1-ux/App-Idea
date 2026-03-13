import { useGameStore } from '../../store/gameStore';
import { SPECIES_MAP, TYPE_COLORS, TYPE_ICONS } from '../../data/petSpecies';

export default function BattleView() {
  const battle = useGameStore(s => s.battle);
  const pets = useGameStore(s => s.pets);
  const activeTeam = useGameStore(s => s.activeTeam);
  const battlesWon = useGameStore(s => s.battlesWon);
  const startBattle = useGameStore(s => s.startBattle);
  const performAttack = useGameStore(s => s.performAttack);
  const performSpecial = useGameStore(s => s.performSpecial);
  const performFlee = useGameStore(s => s.performFlee);
  const endBattle = useGameStore(s => s.endBattle);
  const setActiveView = useGameStore(s => s.setActiveView);
  const buildings = useGameStore(s => s.buildings);

  const hasArena = buildings.some(b => b.type === 'arena');
  const teamPets = activeTeam.map(id => pets.find(p => p.id === id)).filter(Boolean);

  if (!battle) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-bold text-white mb-1">Battle Arena</h2>
        <p className="text-xs text-gray-400 mb-4">Form your team and challenge wild creatures.</p>

        {!hasArena ? (
          <div className="bg-game-card border border-orange-500/40 rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">⚔️</div>
            <p className="text-sm text-orange-300 font-semibold">Arena Required</p>
            <p className="text-xs text-gray-400 mt-1">Build an Arena on your base to unlock battles.</p>
            <button
              onClick={() => setActiveView('base')}
              className="mt-3 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
            >
              Go to Base
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-game-card border border-game-border rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{battlesWon}</div>
                  <div className="text-xs text-gray-400">Battles Won</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-violet-400">Round {battlesWon + 1}</div>
                  <div className="text-xs text-gray-400">Current Challenge</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{100 + (battlesWon + 1) * 50}🪙</div>
                  <div className="text-xs text-gray-400">Win Reward</div>
                </div>
              </div>
            </div>

            {/* Team display */}
            <h3 className="text-sm font-bold text-gray-300 mb-2">Your Team</h3>
            {teamPets.length === 0 ? (
              <div className="bg-game-card border border-dashed border-gray-600 rounded-xl p-4 text-center mb-4">
                <p className="text-xs text-gray-500">No pets in team. Add pets from the Pets tab!</p>
                <button
                  onClick={() => setActiveView('collection')}
                  className="mt-2 text-xs text-violet-400 underline"
                >
                  Go to Pets
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {teamPets.map(pet => {
                  if (!pet) return null;
                  const species = SPECIES_MAP[pet.speciesId];
                  return (
                    <div key={pet.id} className="bg-game-card border border-game-border rounded-xl p-3 flex items-center gap-3">
                      <span className="text-3xl">{species?.emojis[pet.stage] ?? '❓'}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{pet.nickname}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_COLORS[species?.type ?? 'fire']}`}>
                            {TYPE_ICONS[species?.type ?? 'fire']}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">Lv{pet.level} • ATK {pet.stats.attack} • DEF {pet.stats.defense}</div>
                        <div className="h-1.5 bg-black/40 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${Math.round((pet.stats.hp / pet.stats.maxHp) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">HP {pet.stats.hp}/{pet.stats.maxHp}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              disabled={teamPets.length === 0}
              onClick={startBattle}
              className={`w-full py-4 font-bold text-lg rounded-xl transition active:scale-95 ${
                teamPets.length > 0
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-lg shadow-red-500/20'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              ⚔️ Start Battle!
            </button>
          </>
        )}
      </div>
    );
  }

  // Active battle
  const currentPlayerPet = pets.find(p => p.id === battle.playerTeam[battle.playerIndex]);
  const currentEnemy = battle.enemies[battle.enemyIndex];
  const playerHp = battle.playerHps[battle.playerTeam[battle.playerIndex]] ?? 0;
  const enemyHp = battle.enemyHps[currentEnemy?.id ?? ''] ?? 0;
  const playerMaxHp = currentPlayerPet?.stats.maxHp ?? 1;
  const enemyMaxHp = currentEnemy?.stats.maxHp ?? 1;
  const playerSpecies = currentPlayerPet ? SPECIES_MAP[currentPlayerPet.speciesId] : null;
  const enemySpecies = currentEnemy ? SPECIES_MAP[currentEnemy.speciesId] : null;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Battle header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold text-red-400">⚔️ Round {battle.round}</span>
        <span className="text-xs text-gray-400">
          Enemies: {battle.enemyIndex + 1}/{battle.enemies.length}
        </span>
      </div>

      {/* Enemy side */}
      <div className="bg-game-card border border-red-500/20 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-bold text-red-300">{currentEnemy?.name ?? '???'}</span>
            <div className="text-xs text-gray-400">
              Lv{currentEnemy?.level} • {enemySpecies && (
                <span className={TYPE_COLORS[enemySpecies.type].split(' ')[0]}>
                  {TYPE_ICONS[enemySpecies.type]} {enemySpecies.type}
                </span>
              )}
            </div>
          </div>
          <span className="text-5xl">{enemySpecies?.emojis[currentEnemy?.stage ?? 'adult'] ?? '❓'}</span>
        </div>
        <div className="h-3 bg-black/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all"
            style={{ width: `${Math.round((enemyHp / enemyMaxHp) * 100)}%` }}
          />
        </div>
        <div className="text-xs text-right text-gray-400 mt-1">{enemyHp}/{enemyMaxHp} HP</div>
      </div>

      {/* Player side */}
      <div className="bg-game-card border border-green-500/20 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-5xl">{playerSpecies?.emojis[currentPlayerPet?.stage ?? 'adult'] ?? '❓'}</span>
          <div className="text-right">
            <span className="text-sm font-bold text-green-300">{currentPlayerPet?.nickname ?? '???'}</span>
            <div className="text-xs text-gray-400">
              Lv{currentPlayerPet?.level} • {playerSpecies && (
                <span className={TYPE_COLORS[playerSpecies.type].split(' ')[0]}>
                  {TYPE_ICONS[playerSpecies.type]} {playerSpecies.type}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Team: {battle.playerIndex + 1}/{battle.playerTeam.length}
            </div>
          </div>
        </div>
        <div className="h-3 bg-black/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${Math.round((playerHp / playerMaxHp) * 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">{playerHp}/{playerMaxHp} HP</div>
      </div>

      {/* Battle log */}
      <div className="bg-black/40 border border-game-border rounded-xl p-3 mb-4 h-24 overflow-y-auto">
        {battle.log.slice(-6).map((line, i) => (
          <p key={i} className="text-xs text-gray-300 leading-relaxed">{line}</p>
        ))}
      </div>

      {/* Result overlay */}
      {battle.result ? (
        <div className={`rounded-xl p-6 text-center mb-3 ${battle.result === 'win' ? 'bg-green-900/40 border border-green-500/40' : 'bg-red-900/40 border border-red-500/40'}`}>
          <div className="text-4xl mb-2">{battle.result === 'win' ? '🏆' : '💔'}</div>
          <div className="text-xl font-bold text-white mb-1">{battle.result === 'win' ? 'Victory!' : 'Defeated!'}</div>
          {battle.result === 'win' && (
            <div className="text-sm text-green-400">+{battle.goldReward}🪙 +{battle.xpReward} XP</div>
          )}
          <button
            onClick={endBattle}
            className="mt-3 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2 rounded-xl transition"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <BattleBtn
            emoji="⚔️"
            label="Attack"
            color="bg-red-700 hover:bg-red-600"
            disabled={battle.turn !== 'player'}
            onClick={performAttack}
          />
          <BattleBtn
            emoji="✨"
            label="Special"
            color="bg-purple-700 hover:bg-purple-600"
            disabled={battle.turn !== 'player'}
            onClick={performSpecial}
          />
          <BattleBtn
            emoji="🏃"
            label="Flee"
            color="bg-gray-700 hover:bg-gray-600"
            disabled={battle.turn !== 'player'}
            onClick={performFlee}
          />
        </div>
      )}

      {battle.turn === 'enemy' && !battle.result && (
        <div className="text-center mt-3 text-xs text-gray-400 animate-pulse">Enemy is attacking...</div>
      )}
    </div>
  );
}

function BattleBtn({ emoji, label, color, disabled, onClick }: {
  emoji: string; label: string; color: string;
  disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`py-3 rounded-xl font-bold text-white flex flex-col items-center gap-1 transition active:scale-95 ${
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-700' : color
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}
