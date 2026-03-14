import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BUILDING_DEFS, BUILDING_ORDER } from '../../data/buildingData';
import { BuildingType, BasePlot, PlacedBuilding } from '../../types';
import PetSprite from '../UI/PetSprite';
import BuildingSprite from '../UI/BuildingSprite';

const COLS = 4;
const ROWS = 3;

// Stump and rock positions as [fractional x, fractional y] within the map container
const STUMP_POSITIONS: [number, number][] = [
  [0.12, 0.18], [0.82, 0.14], [0.08, 0.70], [0.90, 0.68], [0.50, 0.86],
];
const ROCK_POSITIONS: [number, number][] = [
  [0.24, 0.44], [0.78, 0.40], [0.16, 0.62], [0.84, 0.58],
];

interface TileMetrics { w: number; h: number }

function tileCenter(col: number, row: number, m: TileMetrics) {
  return { x: col * m.w + m.w / 2, y: row * m.h + m.h / 2 };
}

function randomInTile(col: number, row: number, m: TileMetrics, inset = 0.25) {
  return {
    x: col * m.w + m.w * inset + Math.random() * m.w * (1 - inset * 2),
    y: row * m.h + m.h * inset + Math.random() * m.h * (1 - inset * 2),
    flip: Math.random() > 0.5,
  };
}

interface PetPos { x: number; y: number; flip: boolean }

export default function BaseView() {
  const plots          = useGameStore(s => s.plots);
  const buildings      = useGameStore(s => s.buildings);
  const pets           = useGameStore(s => s.pets);
  const gold           = useGameStore(s => s.gold);
  const gems           = useGameStore(s => s.gems);
  const unlockPlot     = useGameStore(s => s.unlockPlot);
  const buildOnPlot    = useGameStore(s => s.buildOnPlot);
  const upgradeBuilding = useGameStore(s => s.upgradeBuilding);
  const setSelectedPet = useGameStore(s => s.setSelectedPet);
  const setActiveView  = useGameStore(s => s.setActiveView);

  const [selectedPlotId,     setSelectedPlotId]     = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // ── Drag-to-place state ──────────────────────────────────────────────────
  const [dragBuilding,    setDragBuilding]    = useState<BuildingType | null>(null);
  const [dragPos,         setDragPos]         = useState<{ x: number; y: number } | null>(null);
  const [dragOverPlotId,  _setDragOverPlotId] = useState<string | null>(null);
  const [showPalette,     setShowPalette]     = useState(false);

  const dragOverPlotIdRef = useRef<string | null>(null);
  const plotsRef          = useRef(plots);
  const metricsRef        = useRef<TileMetrics>({ w: 80, h: 70 });
  const buildOnPlotRef    = useRef(buildOnPlot);
  const containerRef      = useRef<HTMLDivElement>(null);

  const setDragOverPlotId = (v: string | null) => {
    dragOverPlotIdRef.current = v;
    _setDragOverPlotId(v);
  };

  useEffect(() => { plotsRef.current = plots; },          [plots]);
  useEffect(() => { buildOnPlotRef.current = buildOnPlot; }, [buildOnPlot]);

  const [metrics, setMetrics] = useState<TileMetrics>({ w: 80, h: 70 });
  const [petPos,  setPetPos]  = useState<Record<string, PetPos>>({});

  const unlockedPlots = plots.filter(p => p.unlocked);
  const roamingPets   = pets.filter(p => !p.isBreeding && !p.isInTeam && p.stage !== 'egg');
  const breedingPets  = pets.filter(p => p.isBreeding);
  const teamPets      = pets.filter(p => p.isInTeam);
  const eggPets       = pets.filter(p => p.stage === 'egg' && !p.isBreeding);
  const existingTypes = new Set(buildings.map(b => b.type));
  const availableBuildings = BUILDING_ORDER.filter(t => !existingTypes.has(t));

  // ── Landscape-aware tile sizing ──────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const availW = el.clientWidth;
      // Reserve ~80% of viewport height for the map (leaves room for resource bar + nav)
      const availH = window.innerHeight * 0.8;
      const byWidth  = availW / COLS;
      const byHeight = availH / (ROWS * 0.88);   // max w so mapH fits
      const w = Math.min(byWidth, byHeight);
      const next = { w, h: w * 0.88 };
      setMetrics(next);
      metricsRef.current = next;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const mapH = metrics.h * ROWS;
  const mapW = metrics.w * COLS;

  const pickRoamPos = useCallback((): PetPos => {
    if (unlockedPlots.length === 0) return { x: metrics.w / 2, y: metrics.h / 2, flip: false };
    const p = unlockedPlots[Math.floor(Math.random() * unlockedPlots.length)];
    return randomInTile(p.col, p.row, metrics);
  }, [unlockedPlots, metrics]);

  useEffect(() => {
    setPetPos(prev => {
      const next: Record<string, PetPos> = {};
      roamingPets.forEach(p => { next[p.id] = prev[p.id] ?? pickRoamPos(); });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roamingPets.length, metrics.w]);

  useEffect(() => {
    const id = setInterval(() => {
      if (roamingPets.length === 0) return;
      const pet = roamingPets[Math.floor(Math.random() * roamingPets.length)];
      setPetPos(prev => ({ ...prev, [pet.id]: pickRoamPos() }));
    }, 2500);
    return () => clearInterval(id);
  }, [roamingPets, pickRoamPos]);

  // ── Drag event handlers ──────────────────────────────────────────────────
  useEffect(() => {
    if (!dragBuilding) return;

    const handleMove = (e: PointerEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDragPos({ x, y });

      const m = metricsRef.current;
      const valid = plotsRef.current.filter(p => p.unlocked && !p.buildingId);
      let nearest: BasePlot | null = null;
      let minD = Infinity;
      for (const p of valid) {
        const cx = p.col * m.w + m.w / 2;
        const cy = p.row * m.h + m.h / 2;
        const d  = Math.hypot(x - cx, y - cy);
        if (d < minD) { minD = d; nearest = p; }
      }
      setDragOverPlotId(nearest && minD < m.w * 0.75 ? nearest.id : null);
    };

    const handleUp = () => {
      const plotId = dragOverPlotIdRef.current;
      if (dragBuilding && plotId) buildOnPlotRef.current(plotId, dragBuilding);
      setDragBuilding(null);
      setDragPos(null);
      setDragOverPlotId(null);
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup',   handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup',   handleUp);
    };
  }, [dragBuilding]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────────────
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

  const selectedPlot     = plots.find(p => p.id === selectedPlotId);
  const selectedBuilding = selectedBuildingId ? buildings.find(b => b.id === selectedBuildingId) : null;

  const handleTileClick = (p: BasePlot) => {
    if (dragBuilding) return;
    const bldg = buildingForPlot(p);
    if (bldg) {
      setSelectedBuildingId(bldg.id);
      setSelectedPlotId(null);
    } else {
      setSelectedPlotId(p.id);
      setSelectedBuildingId(null);
    }
    setShowPalette(false);
  };

  const handlePetClick = (petId: string) => {
    setSelectedPet(petId);
    setActiveView('collection');
  };

  const dismiss = () => {
    setSelectedPlotId(null);
    setSelectedBuildingId(null);
  };

  const handlePalettePointerDown = (e: React.PointerEvent, type: BuildingType) => {
    e.preventDefault();
    setDragBuilding(type);
    setShowPalette(false);
    setSelectedPlotId(null);
    setSelectedBuildingId(null);
  };

  const bldgSize  = Math.round(metrics.w * 0.82);
  const ghostSize = Math.round(metrics.w * 0.86);

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── World map ─────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        style={{
          height: mapH,
          background: '#0a1a04',   // dark forest background
          touchAction: dragBuilding ? 'none' : 'auto',
        }}
      >
        {/* ── z=1: Grass diamond terrain ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: '#4e8020',
            clipPath: 'polygon(50% -22%, 122% 50%, 50% 122%, -22% 50%)',
            zIndex: 1,
          }}
        />

        {/* ── z=2: Centre brightness glow ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 55%, rgba(110,185,45,0.22) 0%, transparent 68%)',
            zIndex: 2,
          }}
        />

        {/* ── z=3: CoC tile grid lines ── */}
        {mapH > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%" height="100%"
            viewBox={`0 0 ${mapW} ${mapH}`}
            style={{ zIndex: 3 }}
          >
            <line x1={metrics.w}   y1="0" x2={metrics.w}   y2={mapH} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            <line x1={metrics.w*2} y1="0" x2={metrics.w*2} y2={mapH} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            <line x1={metrics.w*3} y1="0" x2={metrics.w*3} y2={mapH} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            <line x1="0" y1={metrics.h}   x2={mapW} y2={metrics.h}   stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            <line x1="0" y1={metrics.h*2} x2={mapW} y2={metrics.h*2} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          </svg>
        )}

        {/* ── z=4: Terrain decorations (stumps + rocks) ── */}
        {mapH > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%" height="100%"
            viewBox={`0 0 ${mapW} ${mapH}`}
            style={{ zIndex: 4 }}
          >
            {STUMP_POSITIONS.map(([fx, fy], i) => {
              const cx = fx * mapW;
              const cy = fy * mapH;
              const r  = metrics.w * 0.045;
              return (
                <g key={`stump_${i}`}>
                  <ellipse cx={cx} cy={cy + r * 0.6} rx={r * 1.4} ry={r * 0.5} fill="rgba(0,0,0,0.28)" />
                  <circle  cx={cx} cy={cy} r={r}        fill="#4a2c10" />
                  <circle  cx={cx} cy={cy} r={r * 0.68} fill="#3a2008" />
                  <circle  cx={cx} cy={cy} r={r * 0.35} fill="#2a1204" opacity="0.75" />
                  {/* growth rings */}
                  <circle  cx={cx} cy={cy} r={r * 0.5}  fill="none" stroke="#2a1204" strokeWidth="0.8" opacity="0.4" />
                </g>
              );
            })}
            {ROCK_POSITIONS.map(([fx, fy], i) => {
              const cx = fx * mapW;
              const cy = fy * mapH;
              const r  = metrics.w * 0.038;
              return (
                <g key={`rock_${i}`}>
                  <ellipse cx={cx}           cy={cy + r * 0.4} rx={r * 1.7} ry={r * 0.55} fill="rgba(0,0,0,0.25)" />
                  <ellipse cx={cx}           cy={cy}           rx={r * 1.6} ry={r}         fill="#4a4840" />
                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r}      ry={r * 0.6}   fill="#6a6858" opacity="0.55" />
                </g>
              );
            })}
          </svg>
        )}

        {/* ── z=5: Edge vignette (depth) ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 36%, rgba(0,0,0,0.55) 100%)',
            zIndex: 5,
          }}
        />

        {/* ── z=6: Corner tree clusters ── */}
        {/* Top-left */}
        <div className="absolute pointer-events-none" style={{ left: '-5%', top: '-3%', display: 'flex', gap: 3, zIndex: 6 }}>
          {(['🌲','🌳','🌲'] as const).map((e, i) => (
            <span key={i} style={{ fontSize: [34, 29, 27][i], filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))', opacity: 0.93 }}>{e}</span>
          ))}
        </div>
        {/* Top-right */}
        <div className="absolute pointer-events-none" style={{ right: '-5%', top: '-3%', display: 'flex', gap: 3, zIndex: 6 }}>
          {(['🌳','🌲','🌲'] as const).map((e, i) => (
            <span key={i} style={{ fontSize: [30, 35, 25][i], filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))', opacity: 0.93 }}>{e}</span>
          ))}
        </div>
        {/* Bottom-left */}
        <div className="absolute pointer-events-none" style={{ left: '-5%', bottom: '-3%', display: 'flex', gap: 3, zIndex: 6 }}>
          {(['🌳','🌲','🌿'] as const).map((e, i) => (
            <span key={i} style={{ fontSize: [29, 33, 21][i], filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))', opacity: 0.93 }}>{e}</span>
          ))}
        </div>
        {/* Bottom-right */}
        <div className="absolute pointer-events-none" style={{ right: '-5%', bottom: '-3%', display: 'flex', gap: 3, zIndex: 6 }}>
          {(['🌲','🌳','🌲'] as const).map((e, i) => (
            <span key={i} style={{ fontSize: [33, 29, 27][i], filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))', opacity: 0.93 }}>{e}</span>
          ))}
        </div>

        {/* ── z=7: Plot hit zones ── */}
        {plots.map(p => {
          const bldg       = buildingForPlot(p);
          const isSelected = selectedPlotId === p.id || (bldg && selectedBuildingId === bldg.id);
          const isDragTarget = p.id === dragOverPlotId && p.unlocked && !bldg;
          const left = p.col * metrics.w;
          const top  = p.row * metrics.h;

          return (
            <div
              key={p.id}
              onClick={() => handleTileClick(p)}
              className="absolute cursor-pointer transition-all duration-150 active:brightness-90"
              style={{ left, top, width: metrics.w, height: metrics.h, background: 'transparent', border: 'none', zIndex: 7 }}
            >
              {/* Locked: dark fog */}
              {!p.unlocked && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'rgba(0,0,14,0.72)' }} />
              )}
              {/* Selected: gold ring */}
              {isSelected && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ border: '2px solid #f5a623', boxShadow: 'inset 0 0 18px rgba(245,166,35,0.38)' }} />
              )}
              {/* Drag target: dashed gold */}
              {isDragTarget && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  border: '2.5px dashed #f5a623',
                  boxShadow: 'inset 0 0 22px rgba(245,166,35,0.55), 0 0 12px rgba(245,166,35,0.4)',
                  borderRadius: 4,
                }} />
              )}
              {/* Locked: padlock + cost */}
              {!p.unlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none" style={{ zIndex: 2 }}>
                  <span style={{ fontSize: metrics.w * 0.24, lineHeight: 1 }}>🔒</span>
                  <span className="text-[8px] font-bold" style={{ color: '#9a7840' }}>🪙{p.unlockCost.gold}</span>
                </div>
              )}
              {/* Empty unlocked: subtle "+" hint */}
              {p.unlocked && !bldg && !isSelected && !isDragTarget && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                  <span className="text-green-200 font-bold text-2xl">+</span>
                </div>
              )}
            </div>
          );
        })}

        {/* ── z=10: 3D Building sprites ── */}
        {buildings.map(b => {
          const def   = BUILDING_DEFS[b.type];
          const plot  = plotForBuilding(b);
          if (!plot) return null;
          const isSelected = selectedBuildingId === b.id;
          const cx = plot.col * metrics.w + metrics.w / 2;
          const cy = plot.row * metrics.h + metrics.h / 2;

          return (
            <div
              key={b.id}
              onClick={() => { setSelectedBuildingId(b.id); setSelectedPlotId(null); }}
              className="absolute flex flex-col items-center cursor-pointer active:scale-90 transition-transform"
              style={{ left: cx - bldgSize / 2, top: cy - bldgSize * 0.72, zIndex: 10 }}
            >
              {isSelected && (
                <div className="absolute text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap" style={{
                  top: -20, left: '50%', transform: 'translateX(-50%)',
                  background: '#f5a623', color: '#1a0800', boxShadow: '0 1px 0 #8a4a00',
                }}>
                  {def.name}
                </div>
              )}
              <BuildingSprite type={b.type} level={b.level} size={bldgSize} state={isSelected ? 'selected' : 'idle'} />
              <div className="text-[8px] font-black px-1.5 py-0.5 rounded-full -mt-1" style={{
                background: isSelected ? '#f5a623' : 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
                border: `1px solid ${isSelected ? '#f5a623' : '#6b4f1a'}`,
                color: isSelected ? '#1a0800' : '#ffd166',
                boxShadow: isSelected ? '0 0 6px rgba(245,166,35,0.5)' : undefined,
              }}>
                Lv{b.level}
              </div>
            </div>
          );
        })}

        {/* ── z=20: Roaming pets ── */}
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
                variant={pet.evolutionVariant}
                size={spriteSize}
                state="idle"
                flip={pos.flip}
              />
              {(pet.needs.hunger < 25 || pet.needs.happiness < 25) && (
                <span className="absolute animate-bounce-slow" style={{ fontSize: 10, top: -8, right: -4 }}>⚠️</span>
              )}
            </div>
          );
        })}

        {/* ── z=15: Breeding pets near den ── */}
        {denPlot && breedingPets.map((pet, i) => {
          const spriteSize = Math.round(metrics.w * 0.32);
          const cx = denPlot.col * metrics.w + metrics.w * (i === 0 ? 0.25 : 0.7);
          const cy = denPlot.row * metrics.h + metrics.h * 0.62;
          return (
            <div key={`breed_${pet.id}`} onClick={() => handlePetClick(pet.id)}
              className="absolute cursor-pointer"
              style={{ left: cx - spriteSize / 2, top: cy - spriteSize, zIndex: 15 }}>
              <PetSprite speciesId={pet.speciesId} stage={pet.stage} variant={pet.evolutionVariant} size={spriteSize} state="idle" flip={i === 1} />
              <span className="absolute text-[9px]" style={{ top: -8, right: -2 }}>💕</span>
            </div>
          );
        })}

        {/* ── z=15: Team pets near arena ── */}
        {arenaPlot && teamPets.map((pet, i) => {
          const spriteSize = Math.round(metrics.w * 0.30);
          const offsets = [0.2, 0.5, 0.78];
          const cx = arenaPlot.col * metrics.w + metrics.w * offsets[i % offsets.length];
          const cy = arenaPlot.row * metrics.h + metrics.h * 0.65;
          return (
            <div key={`team_${pet.id}`} onClick={() => handlePetClick(pet.id)}
              className="absolute cursor-pointer"
              style={{ left: cx - spriteSize / 2, top: cy - spriteSize, zIndex: 15 }}>
              <PetSprite speciesId={pet.speciesId} stage={pet.stage} variant={pet.evolutionVariant} size={spriteSize} state="idle" flip={i % 2 === 0} />
              <span className="absolute text-[9px]" style={{ top: -8, right: -2 }}>⚔️</span>
            </div>
          );
        })}

        {/* ── z=15: Egg pets near nest ── */}
        {nestPlot && eggPets.slice(0, 4).map((pet, i) => {
          const cx = nestPlot.col * metrics.w + metrics.w * (0.18 + (i % 2) * 0.42);
          const cy = nestPlot.row * metrics.h + metrics.h * (0.55 + Math.floor(i / 2) * 0.25);
          return (
            <div key={`egg_${pet.id}`} onClick={() => handlePetClick(pet.id)}
              className="absolute cursor-pointer animate-bounce-slow"
              style={{ left: cx - 10, top: cy - 14, zIndex: 15 }}>
              <span style={{ fontSize: metrics.w * 0.22 }}>🥚</span>
            </div>
          );
        })}

        {/* ── z=40: Ghost building while dragging ── */}
        {dragBuilding && dragPos && (
          <div style={{
            position: 'absolute',
            left: dragPos.x - ghostSize / 2,
            top:  dragPos.y - ghostSize * 1.05,
            zIndex: 40, pointerEvents: 'none',
          }}>
            <BuildingSprite type={dragBuilding} size={ghostSize} state="ghost" />
          </div>
        )}

        {/* ── z=50: Building palette toggle ── */}
        {availableBuildings.length > 0 && (
          <button
            onPointerDown={e => { e.stopPropagation(); setShowPalette(v => !v); }}
            style={{
              position: 'absolute', left: 10, bottom: 10,
              width: 50, height: 50, zIndex: 50,
              borderRadius: '50%',
              background: showPalette
                ? 'linear-gradient(to bottom, #d4860a, #a05c00)'
                : 'linear-gradient(to bottom, #f5a623, #d4860a)',
              border: `2px solid ${showPalette ? '#a05c00' : '#8a5000'}`,
              boxShadow: '0 3px 10px rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, cursor: 'pointer',
              transform: showPalette ? 'rotate(15deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          >
            🔨
          </button>
        )}

        {/* ── z=49: Building palette panel ── */}
        {showPalette && availableBuildings.length > 0 && (
          <div style={{
            position: 'absolute', left: 68, bottom: 10, zIndex: 49,
            background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
            border: '2px solid #6b4f1a', borderRadius: 14,
            padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 6,
            boxShadow: '0 6px 20px rgba(0,0,0,0.75)',
            maxHeight: mapH - 28, overflowY: 'auto',
          }}>
            <div style={{ fontSize: 10, fontWeight: 900, textAlign: 'center', color: '#f5a623', letterSpacing: 1, paddingBottom: 2, borderBottom: '1px solid #4a3010' }}>
              BUILD
            </div>
            {availableBuildings.map(type => {
              const def = BUILDING_DEFS[type];
              const canAfford = gold >= def.baseCost.gold && gems >= def.baseCost.gems;
              return (
                <div
                  key={type}
                  onPointerDown={canAfford ? e => handlePalettePointerDown(e, type) : undefined}
                  style={{
                    background: canAfford ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${canAfford ? '#6b4f1a' : '#2a1808'}`,
                    borderRadius: 10, padding: '5px 7px', cursor: canAfford ? 'grab' : 'not-allowed',
                    opacity: canAfford ? 1 : 0.5,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    userSelect: 'none', touchAction: 'none', minWidth: 74,
                  }}
                >
                  <BuildingSprite type={type} size={52} state="idle" />
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#ddd', textAlign: 'center', whiteSpace: 'nowrap' }}>{def.name}</span>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {def.baseCost.gold > 0 && <span style={{ fontSize: 9, color: gold >= def.baseCost.gold ? '#d4af60' : '#f47' }}>🪙{def.baseCost.gold.toLocaleString()}</span>}
                    {def.baseCost.gems > 0 && <span style={{ fontSize: 9, color: gems >= def.baseCost.gems ? '#90CAF9' : '#f47' }}>💎{def.baseCost.gems}</span>}
                    {def.baseCost.gold === 0 && def.baseCost.gems === 0 && <span style={{ fontSize: 9, color: '#4ade80' }}>Free</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drag hint bar */}
        {dragBuilding && (
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            zIndex: 55, pointerEvents: 'none',
            background: 'rgba(20,10,0,0.85)', border: '1px solid #6b4f1a',
            borderRadius: 20, padding: '5px 14px',
            fontSize: 10, fontWeight: 700, color: '#f5a623', whiteSpace: 'nowrap',
          }}>
            {dragOverPlotId ? '✅ Drop to place!' : 'Drag over an empty plot'}
          </div>
        )}
      </div>

      {/* ── Action panel ──────────────────────────────── */}
      <div className="px-4 pt-3 pb-4 space-y-3">

        {!selectedPlot && !selectedBuilding && (
          <div className="rounded-xl p-3 flex justify-between items-center"
            style={{ background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)', border: '2px solid #6b4f1a' }}>
            <div>
              <h2 className="font-black text-sm" style={{ color: '#f5a623' }}>⚔️ Your Kingdom</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tap 🔨 to drag new buildings onto your base</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>{buildings.length} buildings</div>
              <div>{pets.length} pets</div>
            </div>
          </div>
        )}

        {selectedPlot && !selectedPlot.unlocked && (
          <div className="panel-coc p-4">
            <h3 className="font-bold text-white mb-1">🔒 Locked Plot</h3>
            <p className="text-xs text-gray-400 mb-3">Unlock this land to place buildings here.</p>
            <div className="flex items-center gap-3 mb-3">
              <CostBadge emoji="🪙" val={selectedPlot.unlockCost.gold} have={gold} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => unlockPlot(selectedPlot.id)} className="btn-coc flex-1 py-2.5 text-sm">Unlock Plot</button>
              <button onClick={dismiss} className="text-xs text-gray-500 px-3">✕</button>
            </div>
          </div>
        )}

        {selectedPlot && selectedPlot.unlocked && !selectedPlot.buildingId && (
          <div className="panel-coc p-3 flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div className="flex-1">
              <p className="text-xs text-gray-300 font-semibold">Empty Plot</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Tap 🔨 and drag a building here</p>
            </div>
            <button onClick={dismiss} className="text-xs text-gray-600 px-2">✕</button>
          </div>
        )}

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

// ── Sub-components ───────────────────────────────────────────────────────────

function BuildingPanel({
  building, gold, gems, onUpgrade, onClose,
}: {
  building: PlacedBuilding; gold: number; gems: number;
  onUpgrade: () => void; onClose: () => void;
}) {
  const def = BUILDING_DEFS[building.type];
  const upgCost = { gold: def.upgradeCost.gold * building.level, gems: def.upgradeCost.gems * building.level };
  const canUpgrade = gold >= upgCost.gold && gems >= upgCost.gems;

  return (
    <div className="panel-coc p-4">
      <div className="flex items-center gap-3 mb-2">
        <BuildingSprite type={building.type} size={56} state="idle" />
        <div className="flex-1">
          <h3 className="font-bold text-white">{def.name}</h3>
          <span className="text-xs font-bold" style={{ color: '#f5a623' }}>Level {building.level}</span>
        </div>
        <button onClick={onClose} className="text-xs text-gray-500 px-2">✕</button>
      </div>
      <p className="text-xs text-gray-400 mb-2">{def.description}</p>
      <div className="rounded-lg p-2 mb-3 text-xs text-gray-300"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #4a3810' }}>
        <span className="font-semibold" style={{ color: '#f5a623' }}>Effect: </span>{def.effect}
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
