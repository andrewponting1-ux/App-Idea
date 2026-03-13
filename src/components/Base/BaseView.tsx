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
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="text-lg font-bold text-white mb-1">Your Base</h2>
      <p className="text-xs text-gray-400 mb-4">Build and upgrade structures to grow your realm.</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard label="Pets" value={`${useGameStore.getState().pets.length}`} emoji="🐾" />
        <StatCard label="Buildings" value={`${buildings.length}`} emoji="🏗️" />
        <StatCard label="Battles Won" value={`${useGameStore.getState().battlesWon}`} emoji="🏆" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
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

      {/* Action Panel */}
      {plot && (
        <div className="bg-game-card border border-game-border rounded-xl p-4">
          {!plot.unlocked ? (
            <>
              <h3 className="font-bold text-white mb-1">Locked Plot</h3>
              <p className="text-xs text-gray-400 mb-3">Unlock to build here.</p>
              <div className="flex gap-2 text-sm mb-3">
                <CostBadge emoji="🪙" val={plot.unlockCost.gold} have={gold} />
              </div>
              <button
                onClick={() => unlockPlot(plot.id)}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-lg text-sm transition"
              >
                Unlock Plot
              </button>
            </>
          ) : building ? (
            <BuildingPanel building={building} gold={gold} gems={gems} onUpgrade={() => upgradeBuilding(building.id)} />
          ) : (
            <>
              <h3 className="font-bold text-white mb-1">Empty Plot</h3>
              <p className="text-xs text-gray-400 mb-3">Choose a building to construct here.</p>
              {!buildMenu ? (
                <button
                  onClick={() => setBuildMenu(true)}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-lg text-sm transition"
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
                        className={`w-full flex items-center gap-3 p-2 rounded-lg border text-left transition ${
                          canAfford
                            ? 'bg-black/30 border-game-border hover:border-violet-500 hover:bg-violet-900/20'
                            : 'bg-black/10 border-game-border/30 opacity-50 cursor-not-allowed'
                        }`}
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
                  <button onClick={() => setBuildMenu(false)} className="w-full text-xs text-gray-500 py-1">Cancel</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
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
  return (
    <button
      onClick={onSelect}
      className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
        !plot.unlocked
          ? 'bg-black/40 border-gray-700/40 opacity-60'
          : isSelected
          ? 'bg-violet-900/40 border-violet-500 shadow-lg shadow-violet-500/20'
          : building
          ? 'bg-game-card border-game-border hover:border-violet-400'
          : 'bg-black/20 border-dashed border-gray-600 hover:border-gray-400'
      }`}
    >
      {!plot.unlocked ? (
        <>
          <span className="text-xl">🔒</span>
          <span className="text-[9px] text-gray-500">Locked</span>
        </>
      ) : building && def ? (
        <>
          <span className="text-2xl">{def.emoji}</span>
          <span className="text-[9px] text-gray-400 font-medium">Lv{building.level}</span>
        </>
      ) : (
        <>
          <span className="text-lg text-gray-600">+</span>
          <span className="text-[9px] text-gray-600">Build</span>
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
          <span className="text-xs text-violet-400">Level {building.level}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3">{def.description}</p>
      <div className="bg-black/30 rounded-lg p-2 mb-3 text-xs text-gray-300">
        <span className="text-violet-400 font-semibold">Effect: </span>{def.effect}
      </div>
      <div className="flex gap-2 mb-3">
        <CostBadge emoji="🪙" val={upgCost.gold} have={gold} />
        {upgCost.gems > 0 && <CostBadge emoji="💎" val={upgCost.gems} have={gems} />}
      </div>
      <button
        disabled={!canUpgrade}
        onClick={onUpgrade}
        className={`w-full font-bold py-2 rounded-lg text-sm transition ${
          canUpgrade
            ? 'bg-violet-600 hover:bg-violet-500 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        Upgrade to Level {building.level + 1}
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
    <div className="bg-game-card border border-game-border rounded-xl p-3 text-center">
      <div className="text-xl mb-0.5">{emoji}</div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-gray-400">{label}</div>
    </div>
  );
}
