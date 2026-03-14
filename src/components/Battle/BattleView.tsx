import { useGameStore } from '../../store/gameStore';
import { SPECIES_MAP, TYPE_COLORS, TYPE_ICONS } from '../../data/petSpecies';
import PetSprite from '../UI/PetSprite';

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
        <h2
          className="text-lg font-black mb-1"
          style={{ color: '#f5a623', textShadow: '0 -1px 0 rgba(0,0,0,0.5)' }}
        >
          ⚔️ Battle Arena
        </h2>
        <p className="text-xs text-gray-400 mb-4">Form your team and challenge wild creatures.</p>

        {!hasArena ? (
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'linear-gradient(to bottom, #2a0a0a, #1a0808)', border: '2px solid #8a2020' }}
          >
            <div className="text-4xl mb-2">⚔️</div>
            <p className="text-sm font-semibold" style={{ color: '#f87171' }}>Arena Required</p>
            <p className="text-xs text-gray-400 mt-1">Build an Arena on your base to unlock battles.</p>
            <button
              onClick={() => setActiveView('base')}
              className="btn-coc-red mt-3 px-6 py-2 text-sm"
            >
              Go to Base
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{
                background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
                border: '2px solid #6b4f1a',
                boxShadow: 'inset 0 1px 0 rgba(200,150,60,0.12)',
              }}
            >
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#ffd166' }}>{battlesWon}</div>
                  <div className="text-xs text-gray-400">Won</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#f5a623' }}>Round {battlesWon + 1}</div>
                  <div className="text-xs text-gray-400">Challenge</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{100 + (battlesWon + 1) * 50}🪙</div>
                  <div className="text-xs text-gray-400">Reward</div>
                </div>
              </div>
            </div>

            {/* Team */}
            <h3 className="text-sm font-bold text-gray-300 mb-2">Your Team</h3>
            {teamPets.length === 0 ? (
              <div
                className="rounded-xl p-4 text-center mb-4"
                style={{ border: '2px dashed #4a3810', background: 'rgba(0,0,0,0.2)' }}
              >
                <p className="text-xs text-gray-500">No pets in team. Add pets from the Pets tab!</p>
                <button
                  onClick={() => setActiveView('collection')}
                  className="mt-2 text-xs underline"
                  style={{ color: '#f5a623' }}
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
                    <div
                      key={pet.id}
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{
                        background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
                        border: '2px solid #6b4f1a',
                      }}
                    >
                      <PetSprite speciesId={pet.speciesId} stage={pet.stage} variant={pet.evolutionVariant} size={52} state="idle" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{pet.nickname}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_COLORS[species?.type ?? 'fire']}`}>
                            {TYPE_ICONS[species?.type ?? 'fire']}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">Lv{pet.level} • ATK {pet.stats.attack} • DEF {pet.stats.defense}</div>
                        <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #4a3810' }}>
                          <div
                            className="h-full rounded-full hp-bar-player"
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
              className={`btn-coc-red w-full py-4 text-lg ${teamPets.length === 0 ? 'opacity-50' : ''}`}
            >
              ⚔️ Start Battle!
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Active battle ──────────────────────────────────────
  const currentPlayerPet = pets.find(p => p.id === battle.playerTeam[battle.playerIndex]);
  const currentEnemy = battle.enemies[battle.enemyIndex];
  const playerHp = battle.playerHps[battle.playerTeam[battle.playerIndex]] ?? 0;
  const enemyHp = battle.enemyHps[currentEnemy?.id ?? ''] ?? 0;
  const playerMaxHp = currentPlayerPet?.stats.maxHp ?? 1;
  const enemyMaxHp = currentEnemy?.stats.maxHp ?? 1;
  const playerSpecies = currentPlayerPet ? SPECIES_MAP[currentPlayerPet.speciesId] : null;
  const enemySpecies = currentEnemy ? SPECIES_MAP[currentEnemy.speciesId] : null;

  const playerHpPct = Math.round((playerHp / playerMaxHp) * 100);
  const enemyHpPct = Math.round((enemyHp / enemyMaxHp) * 100);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Arena background */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #1a0a0a 0%, #2a1208 50%, #100d05 100%)',
          padding: '12px 16px',
        }}
      >
        {/* Round header */}
        <div
          className="flex justify-between items-center mb-3 pb-2"
          style={{ borderBottom: '1px solid rgba(245,166,35,0.3)' }}
        >
          <span className="text-sm font-black" style={{ color: '#f5a623' }}>⚔️ Round {battle.round}</span>
          <span className="text-xs text-gray-400">
            Enemies: {battle.enemyIndex + 1}/{battle.enemies.length}
          </span>
        </div>

        {/* Enemy side */}
        <div className="mb-1">
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-sm font-bold text-red-300">{currentEnemy?.name ?? '???'}</span>
              <div className="text-xs text-gray-400">
                Lv{currentEnemy?.level} {enemySpecies && (
                  <span className={TYPE_COLORS[enemySpecies.type].split(' ')[0]}>
                    • {TYPE_ICONS[enemySpecies.type]} {enemySpecies.type}
                  </span>
                )}
              </div>
            </div>
            <PetSprite
              speciesId={currentEnemy?.speciesId ?? ''}
              stage={currentEnemy?.stage ?? 'adult'}
              size={110}
              state={battle.turn === 'enemy' && !battle.result ? 'attack' : 'idle'}
              flip={true}
            />
          </div>
          {/* Enemy HP bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>HP</span>
              <span>{enemyHp}/{enemyMaxHp}</span>
            </div>
            <div
              className="h-3.5 rounded overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #6b4f1a' }}
            >
              <div
                className="h-full hp-bar-enemy rounded transition-all"
                style={{ width: `${enemyHpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Horizon divider */}
        <div
          className="my-2 h-px"
          style={{ background: 'linear-gradient(to right, transparent, #6b4f1a, transparent)' }}
        />

        {/* Player side */}
        <div className="mt-1">
          <div className="flex items-end justify-between mb-2">
            <PetSprite
              speciesId={currentPlayerPet?.speciesId ?? ''}
              stage={currentPlayerPet?.stage ?? 'adult'}
              variant={currentPlayerPet?.evolutionVariant}
              size={110}
              state={battle.result === 'win' ? 'victory' : 'idle'}
            />
            <div className="text-right">
              <span className="text-sm font-bold text-green-300">{currentPlayerPet?.nickname ?? '???'}</span>
              <div className="text-xs text-gray-400">
                Lv{currentPlayerPet?.level} {playerSpecies && (
                  <span className={TYPE_COLORS[playerSpecies.type].split(' ')[0]}>
                    • {TYPE_ICONS[playerSpecies.type]} {playerSpecies.type}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Team: {battle.playerIndex + 1}/{battle.playerTeam.length}
              </div>
            </div>
          </div>
          {/* Player HP bar */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>HP</span>
              <span>{playerHp}/{playerMaxHp}</span>
            </div>
            <div
              className="h-3.5 rounded overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #6b4f1a' }}
            >
              <div
                className="h-full hp-bar-player rounded transition-all"
                style={{ width: `${playerHpPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Battle log */}
      <div className="mx-4 mt-3 mb-3 h-20 overflow-y-auto rounded-xl p-3"
        style={{ background: '#120e06', border: '1px solid #4a3810' }}
      >
        {battle.log.slice(-6).map((line, i) => (
          <p key={i} className="text-xs text-gray-300 leading-relaxed italic">{line}</p>
        ))}
      </div>

      {/* Result overlay */}
      {battle.result ? (
        <div
          className="mx-4 rounded-xl p-6 text-center mb-3"
          style={
            battle.result === 'win'
              ? { background: 'linear-gradient(to bottom, #0a2a0a, #061806)', border: '2px solid #22c55e' }
              : { background: 'linear-gradient(to bottom, #2a0a0a, #180606)', border: '2px solid #ef4444' }
          }
        >
          <div className="text-5xl mb-2">{battle.result === 'win' ? '🏆' : '💔'}</div>
          <div className="text-xl font-black text-white mb-1"
            style={{ textShadow: '0 -1px 0 rgba(0,0,0,0.5)' }}
          >
            {battle.result === 'win' ? 'Victory!' : 'Defeated!'}
          </div>
          {battle.result === 'win' && (
            <div className="text-sm font-bold mb-3" style={{ color: '#ffd166' }}>
              +{battle.goldReward}🪙 +{battle.xpReward} XP
            </div>
          )}
          <button onClick={endBattle} className="btn-coc px-6 py-2 text-sm">
            Continue
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4 grid grid-cols-3 gap-2">
          <BattleBtn
            emoji="⚔️"
            label="Attack"
            btnClass="btn-coc-red"
            disabled={battle.turn !== 'player'}
            onClick={performAttack}
          />
          <BattleBtn
            emoji="✨"
            label="Special"
            btnClass="btn-coc-blue"
            disabled={battle.turn !== 'player'}
            onClick={performSpecial}
          />
          <BattleBtn
            emoji="🏃"
            label="Flee"
            btnClass="btn-coc"
            disabled={battle.turn !== 'player'}
            onClick={performFlee}
          />
        </div>
      )}

      {battle.turn === 'enemy' && !battle.result && (
        <div className="text-center pb-3 text-xs text-gray-400 animate-pulse">Enemy is attacking...</div>
      )}
    </div>
  );
}

function BattleBtn({ emoji, label, btnClass, disabled, onClick }: {
  emoji: string; label: string; btnClass: string;
  disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${btnClass} w-full py-3 flex flex-col items-center gap-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
