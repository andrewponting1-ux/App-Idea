import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BUILDING_DEFS, BUILDING_ORDER } from '../../data/buildingData';
import { BuildingType, BasePlot, PlacedBuilding } from '../../types';

export default function BaseView() {
  const plots = useGameStore(s => s.plots);
  const buildings = useGameStore(s => s.buildings);
  const gold = useGameStore(s => s.gold);
  const gems = useGameStore(s => s.gems);
  const unlockPlot = useGameStore(s => s.unlockPlot);
  const buildOnPlot = useGameStore(s => s.buildOnPlot);
  const upgradeBuilding = useGameStore(s => s.upgradeBuilding);

  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [buildMenu, setBuildMenu] = useState(false);

  const plot = plots.find(p => p.id === selectedPlot);
  const building = plot?.buildingId ? buildings.find(b => b.id === plot.buildingId) : null;
  const existingTypes = new Set(buildings.map(b => b.type));

  return (
    <div className="flex-1 overflow-y-auto">
      {/* World background banner */}
      <div
        className="px-4 pt-4 pb-2"
        style={{ background: 'linear-gradient(to bottom, #1a2a4a 0%, #2a3a1a 60%, #1a1208 100%)' }}
      >
        {/* Header */}
        <div className="mb-3">
          <h2
            className="text-lg font-black"
            style={{ color: '#f5a623', textShadow: '0 -1px 0 rgba(0,0,0,0.6)' }}
          >
            ⚔️ Your Kingdom
          </h2>
          <p className="text-xs text-gray-400">Build and upgrade structures to grow your realm.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatCard label="Pets" value={`${useGameStore.getState().pets.length}`} emoji="🐾" />
          <StatCard label="Buildings" value={`${buildings.length}`} emoji="🏗️" />
          <StatCard label="Battles Won" value={`${useGameStore.getState().battlesWon}`} emoji="🏆" />
        </div>

        {/* Plot grid */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {plots.map(p => (
            <PlotTile
              key={p.id}
              plot={p}
              building={p.buildingId ? buildings.find(b => b.id === p.buildingId) : undefined}
              isSelected={selectedPlot === p.id}
              onSelect={() => {
                setSelectedPlot(p.id === selectedPlot ? null : p.id);
                setBuildMenu(false);
              }}
            />
          ))}
        </div>
      </div>

      {/* Action Panel */}
      <div className="px-4 pb-4 pt-3">
        {plot && (
          <div className="panel-coc p-4">
            {!plot.unlocked ? (
              <>
                <h3 className="font-bold text-white mb-1">🔒 Locked Plot</h3>
                <p className="text-xs text-gray-400 mb-3">Spend gold to unlock this land.</p>
                <div className="flex gap-2 text-sm mb-3">
                  <CostBadge emoji="🪙" val={plot.unlockCost.gold} have={gold} />
                </div>
                <button
                  onClick={() => unlockPlot(plot.id)}
                  className="btn-coc w-full py-2.5 text-sm"
                >
                  Unlock Plot
                </button>
              </>
            ) : building ? (
              <BuildingPanel building={building} gold={gold} gems={gems} onUpgrade={() => upgradeBuilding(building.id)} />
            ) : (
              <>
                <h3 className="font-bold text-white mb-1">🌿 Empty Plot</h3>
                <p className="text-xs text-gray-400 mb-3">Choose a building to construct here.</p>
                {!buildMenu ? (
                  <button
                    onClick={() => setBuildMenu(true)}
                    className="btn-coc w-full py-2.5 text-sm"
                  >
                    + Build Here
                  </button>
                ) : (
                  <div className="space-y-2">
                    {BUILDING_ORDER.filter(t => !existingTypes.has(t) || t === 'nest').map(type => {
                      const def = BUILDING_DEFS[type];
                      const canAfford = gold >= def.baseCost.gold && gems >= def.baseCost.gems;
                      return (
                        <button
                          key={type}
                          disabled={!canAfford}
                          onClick={() => { buildOnPlot(plot.id, type as BuildingType); setBuildMenu(false); setSelectedPlot(null); }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition ${
                            canAfford
                              ? 'border-[#6b4f1a] hover:border-[#f5a623]'
                              : 'border-[#3a2a10] opacity-50 cursor-not-allowed'
                          }`}
                          style={{ background: canAfford ? 'linear-gradient(to bottom, #2e2010, #1e1508)' : 'rgba(0,0,0,0.2)' }}
                        >
                          <span className="text-2xl">{def.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white">{def.name}</div>
                            <div className="text-[10px] text-gray-400">{def.effect}</div>
                            <div className="flex gap-2 mt-0.5">
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
                    <button
                      onClick={() => setBuildMenu(false)}
                      className="w-full text-xs text-gray-500 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PlotTile({ plot, building, isSelected, onSelect }: {
  plot: BasePlot;
  building?: PlacedBuilding;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const def = building ? BUILDING_DEFS[building.type] : null;

  let bg = '';
  let border = '';
  let shadow = '';

  if (!plot.unlocked) {
    bg = 'linear-gradient(to bottom, #2a2010, #1a1208)';
    border = '#3a2808';
  } else if (isSelected) {
    bg = 'linear-gradient(to bottom, #4a3820, #2a2010)';
    border = '#f5a623';
    shadow = '0 0 12px rgba(245,166,35,0.5)';
  } else if (building) {
    bg = 'linear-gradient(to bottom, #3a2a10, #241808)';
    border = '#8a6020';
  } else {
    bg = 'linear-gradient(to bottom, #2d4a1a, #1e3010)';
    border = '#4a7a20';
  }

  return (
    <button
      onClick={onSelect}
      className="aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all active:scale-95"
      style={{
        background: bg,
        borderColor: border,
        boxShadow: shadow || 'inset 0 1px 0 rgba(255,255,255,0.06)',
        opacity: !plot.unlocked ? 0.65 : 1,
      }}
    >
      {!plot.unlocked ? (
        <>
          <span className="text-xl">🔒</span>
          <span className="text-[9px] text-gray-500 mt-0.5">Locked</span>
        </>
      ) : building && def ? (
        <>
          <span className="text-2xl">{def.emoji}</span>
          <span
            className="text-[9px] font-bold mt-0.5"
            style={{ color: '#f5a623' }}
          >
            Lv{building.level}
          </span>
        </>
      ) : (
        <>
          <span className="text-xl text-green-600">+</span>
          <span className="text-[9px] text-green-700">Build</span>
        </>
      )}
    </button>
  );
}

function BuildingPanel({ building, gold, gems, onUpgrade }: {
  building: PlacedBuilding;
  gold: number;
  gems: number;
  onUpgrade: () => void;
}) {
  const def = BUILDING_DEFS[building.type];
  const upgCost = {
    gold: def.upgradeCost.gold * building.level,
    gems: def.upgradeCost.gems * building.level,
  };
  const canUpgrade = gold >= upgCost.gold && gems >= upgCost.gems;

  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{def.emoji}</span>
        <div>
          <h3 className="font-bold text-white">{def.name}</h3>
          <span className="text-xs font-bold" style={{ color: '#f5a623' }}>Level {building.level}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3">{def.description}</p>
      <div
        className="rounded-lg p-2 mb-3 text-xs text-gray-300"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #4a3810' }}
      >
        <span className="font-semibold" style={{ color: '#f5a623' }}>Effect: </span>{def.effect}
      </div>
      <div className="flex gap-2 mb-3">
        <CostBadge emoji="🪙" val={upgCost.gold} have={gold} />
        {upgCost.gems > 0 && <CostBadge emoji="💎" val={upgCost.gems} have={gems} />}
      </div>
      <button
        disabled={!canUpgrade}
        onClick={onUpgrade}
        className={`btn-coc w-full py-2.5 text-sm ${!canUpgrade ? '' : ''}`}
      >
        ⬆️ Upgrade to Level {building.level + 1}
      </button>
    </>
  );
}

function CostBadge({ emoji, val, have }: { emoji: string; val: number; have: number }) {
  return (
    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${have >= val ? 'text-gray-300' : 'text-red-400'}`}>
      {emoji} {val.toLocaleString()}
    </span>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
        border: '2px solid #6b4f1a',
        boxShadow: 'inset 0 1px 0 rgba(200,150,60,0.12)',
      }}
    >
      <div className="text-xl mb-0.5">{emoji}</div>
      <div className="text-lg font-bold" style={{ color: '#ffd166' }}>{value}</div>
      <div className="text-[10px] text-gray-400">{label}</div>
    </div>
  );
}
