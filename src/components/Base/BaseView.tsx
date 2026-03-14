import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BUILDING_DEFS, BUILDING_ORDER } from '../../data/buildingData';
import { BuildingType, PlacedBuilding } from '../../types';
import PetSprite from '../UI/PetSprite';
import BuildingSprite from '../UI/BuildingSprite';

const COLLISION_RADIUS_PCT = 9;
const CANVAS_ASPECT = 0.62; // height = width * CANVAS_ASPECT

// Decorative element positions as [fractional x, fractional y] within the terrain canvas
const STUMP_POSITIONS: [number, number][] = [
  [0.12, 0.18], [0.82, 0.14], [0.08, 0.70], [0.90, 0.68], [0.50, 0.86],
];
const ROCK_POSITIONS: [number, number][] = [
  [0.24, 0.44], [0.78, 0.40], [0.16, 0.62], [0.84, 0.58],
];

interface PetPos { x: number; y: number; flip: boolean }

function isInsideIsland(xPct: number, yPct: number): boolean {
  const dx = (xPct - 50) / 40;
  const dy = (yPct - 50) / 42;
  return dx * dx + dy * dy < 1;
}

function hasCollision(xPct: number, yPct: number, buildings: PlacedBuilding[], excludeId?: string): boolean {
  return buildings.some(b => {
    if (b.id === excludeId) return false;
    return Math.hypot(xPct - b.x, yPct - b.y) < COLLISION_RADIUS_PCT;
  });
}

export default function BaseView() {
  const buildings       = useGameStore(s => s.buildings);
  const pets            = useGameStore(s => s.pets);
  const gold            = useGameStore(s => s.gold);
  const gems            = useGameStore(s => s.gems);
  const placeBuilding   = useGameStore(s => s.placeBuilding);
  const moveBuilding    = useGameStore(s => s.moveBuilding);
  const upgradeBuilding = useGameStore(s => s.upgradeBuilding);
  const setSelectedPet  = useGameStore(s => s.setSelectedPet);
  const setActiveView   = useGameStore(s => s.setActiveView);

  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [dragBuilding,       setDragBuilding]        = useState<BuildingType | null>(null);
  const [dragPos,            setDragPos]             = useState<{ x: number; y: number } | null>(null);
  const [dragValid,          setDragValid]           = useState(false);
  const [showPalette,        setShowPalette]         = useState(false);
  const [repositioningId,    setRepositioningId]     = useState<string | null>(null);
  const [canvasSize,         setCanvasSize]          = useState({ w: 0, h: 0 });
  const [petPos,             setPetPos]              = useState<Record<string, PetPos>>({});

  const containerRef        = useRef<HTMLDivElement>(null);
  const canvasSizeRef       = useRef(canvasSize);
  const buildingsRef        = useRef(buildings);
  const dragBuildingRef     = useRef(dragBuilding);
  const repositioningIdRef  = useRef(repositioningId);
  const placeBuildingRef    = useRef(placeBuilding);
  const moveBuildingRef     = useRef(moveBuilding);
  const dragPosRef          = useRef<{ x: number; y: number } | null>(null);
  const dragValidRef        = useRef(false);

  useEffect(() => { canvasSizeRef.current = canvasSize; },     [canvasSize]);
  useEffect(() => { buildingsRef.current = buildings; },       [buildings]);
  useEffect(() => { dragBuildingRef.current = dragBuilding; }, [dragBuilding]);
  useEffect(() => { repositioningIdRef.current = repositioningId; }, [repositioningId]);
  useEffect(() => { placeBuildingRef.current = placeBuilding; }, [placeBuilding]);
  useEffect(() => { moveBuildingRef.current = moveBuilding; },   [moveBuilding]);

  const updateDragPos = (pos: { x: number; y: number } | null) => {
    dragPosRef.current = pos;
    setDragPos(pos);
  };
  const updateDragValid = (v: boolean) => {
    dragValidRef.current = v;
    setDragValid(v);
  };

  const roamingPets  = pets.filter(p => !p.isBreeding && !p.isInTeam && p.stage !== 'egg');
  const breedingPets = pets.filter(p => p.isBreeding);
  const teamPets     = pets.filter(p => p.isInTeam);
  const eggPets      = pets.filter(p => p.stage === 'egg' && !p.isBreeding);
  const existingTypes = new Set(buildings.map(b => b.type));
  const availableBuildings = BUILDING_ORDER.filter(t => !existingTypes.has(t));

  const denBuilding   = buildings.find(b => b.type === 'breeding_den');
  const arenaBuilding = buildings.find(b => b.type === 'arena');
  const nestBuilding  = buildings.find(b => b.type === 'nest');

  // Canvas sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = Math.round(w * CANVAS_ASPECT);
      setCanvasSize({ w, h });
      canvasSizeRef.current = { w, h };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  // Pet roaming
  const pickRoamPos = useCallback((): PetPos => {
    const { w, h } = canvasSizeRef.current;
    if (w === 0 || h === 0) return { x: 50, y: 50, flip: false };
    return {
      x: w * (0.18 + Math.random() * 0.64),
      y: h * (0.28 + Math.random() * 0.44),
      flip: Math.random() > 0.5,
    };
  }, []);

  useEffect(() => {
    if (canvasSize.w === 0) return;
    setPetPos(prev => {
      const next: Record<string, PetPos> = {};
      roamingPets.forEach(p => { next[p.id] = prev[p.id] ?? pickRoamPos(); });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roamingPets.length, canvasSize.w]);

  useEffect(() => {
    const id = setInterval(() => {
      if (roamingPets.length === 0) return;
      const pet = roamingPets[Math.floor(Math.random() * roamingPets.length)];
      setPetPos(prev => ({ ...prev, [pet.id]: pickRoamPos() }));
    }, 2500);
    return () => clearInterval(id);
  }, [roamingPets, pickRoamPos]);

  // Drag event handlers
  useEffect(() => {
    if (!dragBuilding && !repositioningId) return;

    const handleMove = (e: PointerEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      updateDragPos({ x: px, y: py });

      const { w, h } = canvasSizeRef.current;
      if (w === 0 || h === 0) return;
      const xPct = (px / w) * 100;
      const yPct = (py / h) * 100;
      const excludeId = repositioningIdRef.current ?? undefined;
      const valid = isInsideIsland(xPct, yPct) && !hasCollision(xPct, yPct, buildingsRef.current, excludeId);
      updateDragValid(valid);
    };

    const handleUp = () => {
      const pos = dragPosRef.current;
      const { w, h } = canvasSizeRef.current;
      if (pos && w > 0 && h > 0 && dragValidRef.current) {
        const xPct = (pos.x / w) * 100;
        const yPct = (pos.y / h) * 100;
        if (dragBuildingRef.current) {
          placeBuildingRef.current(dragBuildingRef.current, xPct, yPct);
        } else if (repositioningIdRef.current) {
          moveBuildingRef.current(repositioningIdRef.current, xPct, yPct);
        }
      }
      setDragBuilding(null);
      updateDragPos(null);
      updateDragValid(false);
      setRepositioningId(null);
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup',   handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup',   handleUp);
    };
  }, [dragBuilding, repositioningId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuildingClick = (buildingId: string) => {
    if (dragBuilding || repositioningId) return;
    setSelectedBuildingId(buildingId);
    setShowPalette(false);
  };

  const handlePetClick = (petId: string) => {
    setSelectedPet(petId);
    setActiveView('collection');
  };

  const dismiss = () => { setSelectedBuildingId(null); };

  const handlePalettePointerDown = (e: React.PointerEvent, type: BuildingType) => {
    e.preventDefault();
    setDragBuilding(type);
    setShowPalette(false);
    setSelectedBuildingId(null);
  };

  const handleMoveBuilding = (buildingId: string) => {
    setRepositioningId(buildingId);
    setSelectedBuildingId(null);
  };

  const { w: canvasW, h: canvasH } = canvasSize;
  const bldgSize  = Math.round(Math.max(canvasW, 1) * 0.13);
  const ghostSize = Math.round(Math.max(canvasW, 1) * 0.14);
  const selectedBuilding = selectedBuildingId ? buildings.find(b => b.id === selectedBuildingId) : null;
  const activeDragType = dragBuilding ?? (repositioningId ? buildings.find(b => b.id === repositioningId)?.type : null) ?? null;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Terrain canvas ──────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        style={{
          height: canvasH || '62vw',
          background: '#071218',
          touchAction: (dragBuilding || repositioningId) ? 'none' : 'auto',
        }}
      >
        {canvasH > 0 && (
          <>
            {/* z=1: Island cliff edge – slightly larger, offset down for raised look */}
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%"
              viewBox="0 0 1000 620" style={{ zIndex: 1 }}>
              <path
                d="M 120,132 C 200,72 400,52 550,67 C 700,52 870,92 920,172 C 960,252 940,392 900,472 C 860,542 700,592 550,602 C 400,602 240,572 160,502 C 80,432 60,312 80,212 C 90,172 100,152 120,132 Z"
                fill="#3d2810"
              />
            </svg>

            {/* z=2: Grass island surface */}
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%"
              viewBox="0 0 1000 620" style={{ zIndex: 2 }}>
              <defs>
                <radialGradient id="grassGrad" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#6ec52d" />
                  <stop offset="55%" stopColor="#4e8020" />
                  <stop offset="100%" stopColor="#3a6015" />
                </radialGradient>
              </defs>
              <path
                d="M 120,120 C 200,60 400,40 550,55 C 700,40 870,80 920,160 C 960,240 940,380 900,460 C 860,530 700,580 550,590 C 400,590 240,560 160,490 C 80,420 60,300 80,200 C 90,160 100,140 120,120 Z"
                fill="url(#grassGrad)"
              />
              <ellipse cx="500" cy="300" rx="280" ry="200" fill="rgba(130,210,60,0.12)" />
            </svg>

            {/* z=3: Terrain decorations */}
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%"
              viewBox={`0 0 ${canvasW} ${canvasH}`} style={{ zIndex: 3 }}>
              {STUMP_POSITIONS.map(([fx, fy], i) => {
                const cx = fx * canvasW;
                const cy = fy * canvasH;
                const r  = canvasW * 0.018;
                return (
                  <g key={`stump_${i}`}>
                    <ellipse cx={cx} cy={cy + r * 0.6} rx={r * 1.4} ry={r * 0.5} fill="rgba(0,0,0,0.28)" />
                    <circle  cx={cx} cy={cy} r={r}        fill="#4a2c10" />
                    <circle  cx={cx} cy={cy} r={r * 0.68} fill="#3a2008" />
                    <circle  cx={cx} cy={cy} r={r * 0.35} fill="#2a1204" opacity="0.75" />
                    <circle  cx={cx} cy={cy} r={r * 0.5}  fill="none" stroke="#2a1204" strokeWidth="0.8" opacity="0.4" />
                  </g>
                );
              })}
              {ROCK_POSITIONS.map(([fx, fy], i) => {
                const cx = fx * canvasW;
                const cy = fy * canvasH;
                const r  = canvasW * 0.015;
                return (
                  <g key={`rock_${i}`}>
                    <ellipse cx={cx}           cy={cy + r * 0.4} rx={r * 1.7} ry={r * 0.55} fill="rgba(0,0,0,0.25)" />
                    <ellipse cx={cx}           cy={cy}           rx={r * 1.6} ry={r}         fill="#4a4840" />
                    <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r}      ry={r * 0.6}   fill="#6a6858" opacity="0.55" />
                  </g>
                );
              })}
            </svg>

            {/* z=4: Edge vignette for depth */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 50% 50%, transparent 36%, rgba(0,0,0,0.55) 100%)',
              zIndex: 4,
            }} />

            {/* z=5: Corner tree clusters */}
            <div className="absolute pointer-events-none" style={{ left: '-5%', top: '-3%', display: 'flex', gap: 3, zIndex: 5 }}>
              {(['🌲','🌳','🌲'] as const).map((e, i) => (
                <span key={i} style={{ fontSize: [34, 29, 27][i], filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))', opacity: 0.93 }}>{e}</span>
              ))}
            </div>
            <div className="absolute pointer-events-none" style={{ right: '-5%', top: '-3%', display: 'flex', gap: 3, zIndex: 5 }}>
              {(['🌳','🌲','🌲'] as const).map((e, i) => (
                <span key={i} style={{ fontSize: [30, 35, 25][i], filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))', opacity: 0.93 }}>{e}</span>
              ))}
            </div>
            <div className="absolute pointer-events-none" style={{ left: '-5%', bottom: '-3%', display: 'flex', gap: 3, zIndex: 5 }}>
              {(['🌳','🌲','🌿'] as const).map((e, i) => (
                <span key={i} style={{ fontSize: [29, 33, 21][i], filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))', opacity: 0.93 }}>{e}</span>
              ))}
            </div>
            <div className="absolute pointer-events-none" style={{ right: '-5%', bottom: '-3%', display: 'flex', gap: 3, zIndex: 5 }}>
              {(['🌲','🌳','🌲'] as const).map((e, i) => (
                <span key={i} style={{ fontSize: [33, 29, 27][i], filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))', opacity: 0.93 }}>{e}</span>
              ))}
            </div>

            {/* z=10+y: Buildings (depth-sorted by y) */}
            {buildings.map(b => {
              const def = BUILDING_DEFS[b.type];
              const isSelected = selectedBuildingId === b.id;
              const isRepos = repositioningId === b.id;
              const px = (b.x / 100) * canvasW;
              const py = (b.y / 100) * canvasH;
              return (
                <div
                  key={b.id}
                  onClick={() => handleBuildingClick(b.id)}
                  className="absolute flex flex-col items-center cursor-pointer active:scale-90 transition-transform"
                  style={{
                    left: px - bldgSize / 2,
                    top:  py - bldgSize * 0.72,
                    zIndex: 10 + Math.round(b.y),
                    opacity: isRepos ? 0.3 : 1,
                  }}
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

            {/* z=15: Breeding pets near den */}
            {denBuilding && breedingPets.map((pet, i) => {
              const spriteSize = Math.round(canvasW * 0.08);
              const px = (denBuilding.x / 100) * canvasW + (i === 0 ? -spriteSize * 0.9 : spriteSize * 0.5);
              const py = (denBuilding.y / 100) * canvasH + bldgSize * 0.12;
              return (
                <div key={`breed_${pet.id}`} onClick={() => handlePetClick(pet.id)}
                  className="absolute cursor-pointer"
                  style={{ left: px - spriteSize / 2, top: py - spriteSize, zIndex: 15 }}>
                  <PetSprite speciesId={pet.speciesId} stage={pet.stage} variant={pet.evolutionVariant} size={spriteSize} state="idle" flip={i === 1} />
                  <span className="absolute text-[9px]" style={{ top: -8, right: -2 }}>💕</span>
                </div>
              );
            })}

            {/* z=15: Team pets near arena */}
            {arenaBuilding && teamPets.map((pet, i) => {
              const spriteSize = Math.round(canvasW * 0.075);
              const offsets = [-spriteSize * 1.1, 0, spriteSize * 1.1];
              const px = (arenaBuilding.x / 100) * canvasW + offsets[i % offsets.length];
              const py = (arenaBuilding.y / 100) * canvasH + bldgSize * 0.12;
              return (
                <div key={`team_${pet.id}`} onClick={() => handlePetClick(pet.id)}
                  className="absolute cursor-pointer"
                  style={{ left: px - spriteSize / 2, top: py - spriteSize, zIndex: 15 }}>
                  <PetSprite speciesId={pet.speciesId} stage={pet.stage} variant={pet.evolutionVariant} size={spriteSize} state="idle" flip={i % 2 === 0} />
                  <span className="absolute text-[9px]" style={{ top: -8, right: -2 }}>⚔️</span>
                </div>
              );
            })}

            {/* z=15: Egg pets near nest */}
            {nestBuilding && eggPets.slice(0, 4).map((pet, i) => {
              const eggSize = Math.round(canvasW * 0.055);
              const px = (nestBuilding.x / 100) * canvasW + ((i % 2) - 0.5) * eggSize * 1.6;
              const py = (nestBuilding.y / 100) * canvasH + Math.floor(i / 2) * eggSize * 0.8;
              return (
                <div key={`egg_${pet.id}`} onClick={() => handlePetClick(pet.id)}
                  className="absolute cursor-pointer animate-bounce-slow"
                  style={{ left: px - eggSize / 2, top: py - eggSize, zIndex: 15 }}>
                  <span style={{ fontSize: eggSize }}>🥚</span>
                </div>
              );
            })}

            {/* z=20: Roaming pets */}
            {roamingPets.map(pet => {
              const pos = petPos[pet.id];
              if (!pos) return null;
              const spriteSize = Math.round(canvasW * 0.10);
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
                  <PetSprite speciesId={pet.speciesId} stage={pet.stage} variant={pet.evolutionVariant} size={spriteSize} state="idle" flip={pos.flip} />
                  {(pet.needs.hunger < 25 || pet.needs.happiness < 25) && (
                    <span className="absolute animate-bounce-slow" style={{ fontSize: 10, top: -8, right: -4 }}>⚠️</span>
                  )}
                </div>
              );
            })}

            {/* z=40: Ghost building while dragging or repositioning */}
            {activeDragType && dragPos && (
              <div style={{
                position: 'absolute',
                left: dragPos.x - ghostSize / 2,
                top:  dragPos.y - ghostSize * 1.05,
                zIndex: 40, pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute',
                  left: ghostSize * 0.1,
                  bottom: -6,
                  width: ghostSize * 0.8,
                  height: 10,
                  borderRadius: '50%',
                  background: dragValid ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)',
                  boxShadow: dragValid ? '0 0 10px rgba(74,222,128,0.8)' : '0 0 10px rgba(248,113,113,0.8)',
                }} />
                <BuildingSprite type={activeDragType} size={ghostSize} state="ghost" />
              </div>
            )}

            {/* z=50: Building palette toggle */}
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

            {/* z=49: Building palette panel */}
            {showPalette && availableBuildings.length > 0 && (
              <div style={{
                position: 'absolute', left: 68, bottom: 10, zIndex: 49,
                background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
                border: '2px solid #6b4f1a', borderRadius: 14,
                padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 6,
                boxShadow: '0 6px 20px rgba(0,0,0,0.75)',
                maxHeight: canvasH - 28, overflowY: 'auto',
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

            {/* Drag / reposition hint bar */}
            {(dragBuilding || repositioningId) && (
              <div style={{
                position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                zIndex: 55, pointerEvents: 'none',
                background: 'rgba(20,10,0,0.85)', border: '1px solid #6b4f1a',
                borderRadius: 20, padding: '5px 14px',
                fontSize: 10, fontWeight: 700, color: '#f5a623', whiteSpace: 'nowrap',
              }}>
                {dragValid ? '✅ Drop to place!' : repositioningId ? 'Drag to reposition' : 'Drag over the island'}
              </div>
            )}

            {/* Empty state overlay */}
            {buildings.length === 0 && !dragBuilding && !showPalette && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 45, textAlign: 'center', pointerEvents: 'none',
              }}>
                <div style={{
                  background: 'rgba(20,10,0,0.75)',
                  border: '1px solid #6b4f1a',
                  borderRadius: 14, padding: '12px 18px',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🏗️</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f5a623' }}>Build your base!</div>
                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>Tap 🔨 to place buildings</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Action panel ──────────────────────────────── */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        {!selectedBuilding && !dragBuilding && !repositioningId && (
          <div className="rounded-xl p-3 flex justify-between items-center"
            style={{ background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)', border: '2px solid #6b4f1a' }}>
            <div>
              <h2 className="font-black text-sm" style={{ color: '#f5a623' }}>⚔️ Your Kingdom</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tap 🔨 to drag new buildings onto your island</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>{buildings.length} buildings</div>
              <div>{pets.length} pets</div>
            </div>
          </div>
        )}

        {selectedBuilding && (
          <BuildingPanel
            building={selectedBuilding}
            gold={gold}
            gems={gems}
            onUpgrade={() => upgradeBuilding(selectedBuilding.id)}
            onMove={() => handleMoveBuilding(selectedBuilding.id)}
            onClose={dismiss}
          />
        )}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function BuildingPanel({
  building, gold, gems, onUpgrade, onMove, onClose,
}: {
  building: PlacedBuilding; gold: number; gems: number;
  onUpgrade: () => void; onMove: () => void; onClose: () => void;
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
      <div className="flex gap-2">
        <button
          disabled={!canUpgrade}
          onClick={onUpgrade}
          className={`btn-coc flex-1 py-2.5 text-sm ${!canUpgrade ? 'opacity-50' : ''}`}
        >
          ⬆️ Upgrade to Level {building.level + 1}
        </button>
        <button
          onClick={onMove}
          className="btn-coc py-2.5 px-3 text-sm"
          style={{ background: 'linear-gradient(to bottom, #3a5a8a, #2a4a7a)', border: '2px solid #4a6a9a' }}
        >
          ↕️ Move
        </button>
      </div>
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
