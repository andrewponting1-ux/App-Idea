import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BUILDING_DEFS, BUILDING_ORDER } from '../../data/buildingData';
import { BuildingType, BasePlot, PlacedBuilding } from '../../types';
import PetSprite from '../UI/PetSprite';

const COLS = 4;
const ROWS = 3;

// Building emoji display size relative to tile width
const BLDG_EMOJI_SCALE = 0.46;

interface TileMetrics {
  w: number;
  h: number;
}

// Pixel center of a plot tile
function tileCenter(col: number, row: number, m: TileMetrics) {
  return { x: col * m.w + m.w / 2, y: row * m.h + m.h / 2 };
}

// Random position within an unlocked tile (with inset so pets don't clip edges)
function randomInTile(col: number, row: number, m: TileMetrics, inset = 0.25) {
  return {
    x: col * m.w + m.w * inset + Math.random() * m.w * (1 - inset * 2),
    y: row * m.h + m.h * inset + Math.random() * m.h * (1 - inset * 2),
    flip: Math.random() > 0.5,
  };
}

interface PetPos { x: number; y: number; flip: boolean }

export default function BaseView() {
  const plots     = useGameStore(s => s.plots);
  const buildings = useGameStore(s => s.buildings);
  const pets      = useGameStore(s => s.pets);
  const gold      = useGameStore(s => s.gold);
  const gems      = useGameStore(s => s.gems);
  const unlockPlot     = useGameStore(s => s.unlockPlot);
  const buildOnPlot    = useGameStore(s => s.buildOnPlot);
  const upgradeBuilding = useGameStore(s => s.upgradeBuilding);
  const setSelectedPet = useGameStore(s => s.setSelectedPet);
  const setActiveView  = useGameStore(s => s.setActiveView);

  const [selectedPlotId,     setSelectedPlotId]     = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [buildMenu, setBuildMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<TileMetrics>({ w: 80, h: 76 });

  // Pet roaming positions (pixel, within map)
  const [petPos, setPetPos] = useState<Record<string, PetPos>>({});

  const unlockedPlots = plots.filter(p => p.unlocked);
  const roamingPets   = pets.filter(p => !p.isBreeding && !p.isInTeam && p.stage !== 'egg');
  const breedingPets  = pets.filter(p => p.isBreeding);
  const teamPets      = pets.filter(p => p.isInTeam);
  const eggPets       = pets.filter(p => p.stage === 'egg' && !p.isBreeding);

  const existingTypes = new Set(buildings.map(b => b.type));

  // Measure container width → derive tile size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth / COLS;
      setMetrics({ w, h: w * 0.88 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pickRoamPos = useCallback((): PetPos => {
    if (unlockedPlots.length === 0) return { x: metrics.w / 2, y: metrics.h / 2, flip: false };
    const p = unlockedPlots[Math.floor(Math.random() * unlockedPlots.length)];
    return randomInTile(p.col, p.row, metrics);
  }, [unlockedPlots, metrics]);

  // Initialize positions for roaming pets
  useEffect(() => {
    setPetPos(prev => {
      const next: Record<string, PetPos> = {};
      roamingPets.forEach(p => {
        next[p.id] = prev[p.id] ?? pickRoamPos();
      });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roamingPets.length, metrics.w]);

  // Move one random roaming pet every 2.5 s
  useEffect(() => {
    const id = setInterval(() => {
      if (roamingPets.length === 0) return;
      const pet = roamingPets[Math.floor(Math.random() * roamingPets.length)];
      setPetPos(prev => ({ ...prev, [pet.id]: pickRoamPos() }));
    }, 2500);
    return () => clearInterval(id);
  }, [roamingPets, pickRoamPos]);

  const mapH = metrics.h * ROWS;

  // Building helpers
  const buildingForPlot = (p: BasePlot): PlacedBuilding | undefined =>
    p.buildingId ? buildings.find(b => b.id === p.buildingId) : undefined;

  const plotForBuilding = (b: PlacedBuilding): BasePlot | undefined =>
    plots.find(p => p.id === b.plotId);

  const specialBuildingPlot = (type: string) => {
    const bldg = buildings.find(b => b.type === type);
    return bldg ? plotForBuilding(bldg) : undefined;
  };

  const denPlot   = specialBuildingPlot('breeding_den');
  const arenaPlot = specialBuildingPlot('arena');
  const nestPlot  = specialBuildingPlot('nest');

  // Selected state
  const selectedPlot     = plots.find(p => p.id === selectedPlotId);
  const selectedBuilding = selectedBuildingId ? buildings.find(b => b.id === selectedBuildingId) : null;

  const handleTileClick = (p: BasePlot) => {
    const bldg = buildingForPlot(p);
    if (bldg) {
      setSelectedBuildingId(bldg.id);
      setSelectedPlotId(null);
      setBuildMenu(false);
    } else {
      setSelectedPlotId(p.id);
      setSelectedBuildingId(null);
      setBuildMenu(false);
    }
  };

  const handlePetClick = (petId: string) => {
    setSelectedPet(petId);
    setActiveView('collection');
  };

  const dismiss = () => {
    setSelectedPlotId(null);
    setSelectedBuildingId(null);
    setBuildMenu(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Visual map ──────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        style={{
          height: mapH,
          /* Sky → horizon → bright grass → mid earth → dark ground */
          background: 'linear-gradient(to bottom, #0b1630 0%, #122060 9%, #1e4898 17%, #1e6830 20%, #2a8020 24%, #1e5c14 42%, #144010 62%, #0c2808 85%, #071604 100%)',
        }}
      >
        {/* Horizon glow line */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0, right: 0,
            top: '20%',
            height: 2,
            background: 'linear-gradient(to right, transparent 0%, rgba(120,220,60,0.5) 20%, rgba(160,240,80,0.65) 50%, rgba(120,220,60,0.5) 80%, transparent 100%)',
            zIndex: 0,
          }}
        />

        {/* Decorative environment — trees on left edge */}
        {([
          { left: '-2%', top: '18%',  size: 30, e: '🌲' },
          { left:  '0%', top: '38%',  size: 24, e: '🌳' },
          { left: '-1%', top: '58%',  size: 26, e: '🌲' },
          { left:  '1%', top: '74%',  size: 18, e: '🌿' },
        ] as const).map((d, i) => (
          <span key={`tl${i}`} style={{
            position: 'absolute', left: d.left, top: d.top,
            fontSize: d.size, zIndex: 6, opacity: 0.82,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.55))',
          }}>{d.e}</span>
        ))}

        {/* Decorative environment — trees on right edge */}
        {([
          { right: '-2%', top: '21%', size: 28, e: '🌲' },
          { right:  '0%', top: '41%', size: 22, e: '🌳' },
          { right: '-1%', top: '60%', size: 26, e: '🌲' },
          { right:  '1%', top: '76%', size: 18, e: '🌿' },
        ] as const).map((d, i) => (
          <span key={`tr${i}`} style={{
            position: 'absolute', right: d.right, top: d.top,
            fontSize: d.size, zIndex: 6, opacity: 0.82,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.55))',
          }}>{d.e}</span>
        ))}

        {/* Clouds in the sky strip */}
        {([
          { left: '15%', top: '3%', size: 16, opacity: 0.45 },
          { left: '48%', top: '6%', size: 12, opacity: 0.35 },
          { left: '72%', top: '2%', size: 18, opacity: 0.4  },
        ] as const).map((d, i) => (
          <span key={`cl${i}`} style={{
            position: 'absolute', left: d.left, top: d.top,
            fontSize: d.size, zIndex: 0, opacity: d.opacity,
            pointerEvents: 'none',
          }}>☁️</span>
        ))}
        {/* ── Ground tiles — transparent, world shows through ── */}
        {plots.map(p => {
          const bldg       = buildingForPlot(p);
          const isSelected = selectedPlotId === p.id || (bldg && selectedBuildingId === bldg.id);
          const left = p.col * metrics.w;
          const top  = p.row * metrics.h;

          return (
            <div
              key={p.id}
              onClick={() => handleTileClick(p)}
              className="absolute cursor-pointer transition-all duration-150 active:brightness-90"
              style={{
                left, top,
                width: metrics.w,
                height: metrics.h,
                background: 'transparent',
                border: 'none',
                zIndex: 1,
              }}
            >
              {/* Locked territory: dark fog overlay */}
              {!p.unlocked && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'rgba(0,0,14,0.74)' }}
                />
              )}

              {/* Selected: gold ring */}
              {isSelected && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    border: '2px solid #f5a623',
                    boxShadow: 'inset 0 0 18px rgba(245,166,35,0.38)',
                  }}
                />
              )}

              {/* Locked: padlock + cost (above fog) */}
              {!p.unlocked && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none"
                  style={{ zIndex: 2 }}
                >
                  <span style={{ fontSize: metrics.w * 0.26, lineHeight: 1 }}>🔒</span>
                  <span className="text-[8px] font-bold" style={{ color: '#9a7840' }}>
                    🪙{p.unlockCost.gold}
                  </span>
                </div>
              )}

              {/* Empty unlocked: subtle grass flicker hint */}
              {p.unlocked && !bldg && (
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(135deg, transparent 0px, transparent 7px, rgba(255,255,255,0.06) 7px, rgba(255,255,255,0.06) 8px)',
                  }}
                />
              )}

              {/* Empty tap indicator */}
              {p.unlocked && !bldg && !isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <span className="text-green-200 font-bold text-2xl">+</span>
                </div>
              )}
              {p.unlocked && !bldg && isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-2xl">📍</span>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Buildings ─────────────────────────────── */}
        {buildings.map(b => {
          const def   = BUILDING_DEFS[b.type];
          const plot  = plotForBuilding(b);
          if (!plot) return null;
          const isSelected = selectedBuildingId === b.id;
          const cx = plot.col * metrics.w + metrics.w / 2;
          const cy = plot.row * metrics.h + metrics.h / 2;
          const emojiSize = metrics.w * BLDG_EMOJI_SCALE;

          return (
            <div
              key={b.id}
              onClick={() => { setSelectedBuildingId(b.id); setSelectedPlotId(null); setBuildMenu(false); }}
              className="absolute flex flex-col items-center cursor-pointer active:scale-90 transition-transform"
              style={{
                left: cx - metrics.w * 0.42,
                top:  cy - metrics.h * 0.52,
                width: metrics.w * 0.84,
                height: metrics.h * 0.96,
                zIndex: 10,
                justifyContent: 'flex-end',
                paddingBottom: metrics.h * 0.06,
              }}
            >
              {/* Glow ring when selected */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: '0 0 18px rgba(245,166,35,0.6)', borderRadius: 8 }}
                />
              )}

              {/* Building name when selected */}
              {isSelected && (
                <div
                  className="absolute text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{
                    top: -18,
                    background: '#f5a623',
                    color: '#1a0800',
                    boxShadow: '0 1px 0 #8a4a00',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {def.name}
                </div>
              )}

              {/* Drop shadow */}
              <div
                className="absolute pointer-events-none"
                style={{
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: metrics.w * 0.6,
                  height: 7,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.35)',
                }}
              />

              {/* Emoji */}
              <span style={{ fontSize: emojiSize, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                {def.emoji}
              </span>

              {/* Level badge */}
              <div
                className="text-[8px] font-black px-1.5 py-0.5 rounded-full mt-0.5"
                style={{
                  background: isSelected ? '#f5a623' : 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
                  border: `1px solid ${isSelected ? '#f5a623' : '#6b4f1a'}`,
                  color: isSelected ? '#1a0800' : '#ffd166',
                  boxShadow: isSelected ? '0 0 6px rgba(245,166,35,0.5)' : undefined,
                }}
              >
                Lv{b.level}
              </div>
            </div>
          );
        })}

        {/* ── Roaming pets ──────────────────────────── */}
        {roamingPets.map(pet => {
          const pos = petPos[pet.id];
          if (!pos) return null;
          const spriteSize = Math.round(metrics.w * 0.42);
          return (
            <div
              key={pet.id}
              onClick={() => handlePetClick(pet.id)}
              className="absolute cursor-pointer"
              style={{
                left: pos.x - spriteSize / 2,
                top:  pos.y - spriteSize * 0.85,
                zIndex: 20,
                transition: 'left 2.5s ease-in-out, top 2.5s ease-in-out',
              }}
            >
              <PetSprite
                speciesId={pet.speciesId}
                stage={pet.stage}
                size={spriteSize}
                state="idle"
                flip={pos.flip}
              />
              {/* Need warning */}
              {(pet.needs.hunger < 25 || pet.needs.happiness < 25) && (
                <span
                  className="absolute animate-bounce-slow"
                  style={{ fontSize: 10, top: -8, right: -4 }}
                >
                  ⚠️
                </span>
              )}
            </div>
          );
        })}

        {/* ── Breeding pets: show near / in the den ─── */}
        {denPlot && breedingPets.map((pet, i) => {
          const spriteSize = Math.round(metrics.w * 0.32);
          const cx = denPlot.col * metrics.w + metrics.w * (i === 0 ? 0.25 : 0.7);
          const cy = denPlot.row * metrics.h + metrics.h * 0.62;
          return (
            <div
              key={`breed_${pet.id}`}
              onClick={() => handlePetClick(pet.id)}
              className="absolute cursor-pointer"
              style={{ left: cx - spriteSize / 2, top: cy - spriteSize, zIndex: 15 }}
            >
              <PetSprite speciesId={pet.speciesId} stage={pet.stage} size={spriteSize} state="idle" flip={i === 1} />
              <span className="absolute text-[9px]" style={{ top: -8, right: -2 }}>💕</span>
            </div>
          );
        })}

        {/* ── Team pets: show near arena ─────────────── */}
        {arenaPlot && teamPets.map((pet, i) => {
          const spriteSize = Math.round(metrics.w * 0.30);
          const offsets = [0.2, 0.5, 0.78];
          const cx = arenaPlot.col * metrics.w + metrics.w * offsets[i % offsets.length];
          const cy = arenaPlot.row * metrics.h + metrics.h * 0.65;
          return (
            <div
              key={`team_${pet.id}`}
              onClick={() => handlePetClick(pet.id)}
              className="absolute cursor-pointer"
              style={{ left: cx - spriteSize / 2, top: cy - spriteSize, zIndex: 15 }}
            >
              <PetSprite speciesId={pet.speciesId} stage={pet.stage} size={spriteSize} state="idle" flip={i % 2 === 0} />
              <span className="absolute text-[9px]" style={{ top: -8, right: -2 }}>⚔️</span>
            </div>
          );
        })}

        {/* ── Egg pets: show near nest ─────────────── */}
        {nestPlot && eggPets.slice(0, 4).map((pet, i) => {
          const cx = nestPlot.col * metrics.w + metrics.w * (0.18 + (i % 2) * 0.42);
          const cy = nestPlot.row * metrics.h + metrics.h * (0.55 + Math.floor(i / 2) * 0.25);
          return (
            <div
              key={`egg_${pet.id}`}
              onClick={() => handlePetClick(pet.id)}
              className="absolute cursor-pointer animate-bounce-slow"
              style={{ left: cx - 10, top: cy - 14, zIndex: 15 }}
            >
              <span style={{ fontSize: metrics.w * 0.22 }}>🥚</span>
            </div>
          );
        })}
      </div>

      {/* ── Action panel ────────────────────────────── */}
      <div className="px-4 pt-3 pb-4 space-y-3">

        {/* Default: kingdom summary */}
        {!selectedPlot && !selectedBuilding && (
          <div
            className="rounded-xl p-3 flex justify-between items-center"
            style={{ background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)', border: '2px solid #6b4f1a' }}
          >
            <div>
              <h2 className="font-black text-sm" style={{ color: '#f5a623' }}>⚔️ Your Kingdom</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tap buildings or pets to interact</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>{buildings.length} buildings</div>
              <div>{pets.length} pets</div>
            </div>
          </div>
        )}

        {/* Locked plot */}
        {selectedPlot && !selectedPlot.unlocked && (
          <div className="panel-coc p-4">
            <h3 className="font-bold text-white mb-1">🔒 Locked Plot</h3>
            <p className="text-xs text-gray-400 mb-3">
              Unlock this land to build here.
            </p>
            <div className="flex items-center gap-3 mb-3">
              <CostBadge emoji="🪙" val={selectedPlot.unlockCost.gold} have={gold} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => unlockPlot(selectedPlot.id)} className="btn-coc flex-1 py-2.5 text-sm">
                Unlock Plot
              </button>
              <button onClick={dismiss} className="text-xs text-gray-500 px-3">✕</button>
            </div>
          </div>
        )}

        {/* Empty unlocked plot */}
        {selectedPlot && selectedPlot.unlocked && !selectedPlot.buildingId && (
          <div className="panel-coc p-4">
            <h3 className="font-bold text-white mb-1">🌿 Empty Plot</h3>
            {!buildMenu ? (
              <div className="flex gap-2">
                <button onClick={() => setBuildMenu(true)} className="btn-coc flex-1 py-2.5 text-sm">
                  + Build Here
                </button>
                <button onClick={dismiss} className="text-xs text-gray-500 px-3">✕</button>
              </div>
            ) : (
              <div className="space-y-2">
                {BUILDING_ORDER.filter(t => !existingTypes.has(t) || t === 'nest').map(type => {
                  const def = BUILDING_DEFS[type];
                  const canAfford = gold >= def.baseCost.gold && gems >= def.baseCost.gems;
                  return (
                    <button
                      key={type}
                      disabled={!canAfford}
                      onClick={() => {
                        buildOnPlot(selectedPlot.id, type as BuildingType);
                        setBuildMenu(false);
                        dismiss();
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition active:scale-95"
                      style={{
                        background: canAfford ? 'linear-gradient(to bottom, #2e2010, #1e1508)' : 'rgba(0,0,0,0.15)',
                        borderColor: canAfford ? '#6b4f1a' : '#2a1808',
                        opacity: canAfford ? 1 : 0.5,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <span className="text-2xl">{def.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white">{def.name}</div>
                        <div className="text-[10px] text-gray-400">{def.effect}</div>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          {def.baseCost.gold > 0 && <CostBadge emoji="🪙" val={def.baseCost.gold} have={gold} />}
                          {def.baseCost.gems > 0 && <CostBadge emoji="💎" val={def.baseCost.gems} have={gems} />}
                          {def.baseCost.gold === 0 && def.baseCost.gems === 0 && (
                            <span className="text-[10px] text-green-400">Free</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                <button onClick={() => setBuildMenu(false)} className="w-full text-xs text-gray-500 py-1">Cancel</button>
              </div>
            )}
          </div>
        )}

        {/* Building info / upgrade */}
        {selectedBuilding && (
          <BuildingPanel
            building={selectedBuilding}
            gold={gold}
            gems={gems}
            onUpgrade={() => upgradeBuilding(selectedBuilding.id)}
            onClose={dismiss}
          />
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function BuildingPanel({
  building, gold, gems, onUpgrade, onClose,
}: {
  building: PlacedBuilding;
  gold: number;
  gems: number;
  onUpgrade: () => void;
  onClose: () => void;
}) {
  const def = BUILDING_DEFS[building.type];
  const upgCost = {
    gold: def.upgradeCost.gold * building.level,
    gems: def.upgradeCost.gems * building.level,
  };
  const canUpgrade = gold >= upgCost.gold && gems >= upgCost.gems;

  return (
    <div className="panel-coc p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{def.emoji}</span>
        <div className="flex-1">
          <h3 className="font-bold text-white">{def.name}</h3>
          <span className="text-xs font-bold" style={{ color: '#f5a623' }}>Level {building.level}</span>
        </div>
        <button onClick={onClose} className="text-xs text-gray-500 px-2">✕</button>
      </div>

      <p className="text-xs text-gray-400 mb-2">{def.description}</p>

      <div
        className="rounded-lg p-2 mb-3 text-xs text-gray-300"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #4a3810' }}
      >
        <span className="font-semibold" style={{ color: '#f5a623' }}>Active Effect: </span>
        {def.effect}
      </div>

      <div className="flex gap-3 items-center mb-3">
        <span className="text-xs text-gray-400">Upgrade cost:</span>
        <CostBadge emoji="🪙" val={upgCost.gold} have={gold} />
        {upgCost.gems > 0 && <CostBadge emoji="💎" val={upgCost.gems} have={gems} />}
      </div>

      <button
        disabled={!canUpgrade}
        onClick={onUpgrade}
        className={`btn-coc w-full py-2.5 text-sm ${!canUpgrade ? 'opacity-50' : ''}`}
      >
        ⬆️ Upgrade to Level {building.level + 1}
      </button>
    </div>
  );
}

function CostBadge({ emoji, val, have }: { emoji: string; val: number; have: number }) {
  return (
    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${have >= val ? 'text-gray-300' : 'text-red-400'}`}>
      {emoji} {val.toLocaleString()}
    </span>
  );
}
