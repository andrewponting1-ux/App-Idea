import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SHOP_ITEMS, SHOP_CATEGORIES } from '../../data/shopItems';

export default function ShopView() {
  const gold = useGameStore(s => s.gold);
  const gems = useGameStore(s => s.gems);
  const ownedSkins = useGameStore(s => s.ownedSkins);
  const buyShopItem = useGameStore(s => s.buyShopItem);
  const [category, setCategory] = useState<string>('eggs');

  const filteredItems = SHOP_ITEMS.filter(i => i.category === category);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-white mb-1">Shop</h2>
        <p className="text-xs text-gray-400">Expand your collection with eggs, food, cosmetics, and more.</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {SHOP_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-full font-medium transition ${
              category === cat.id
                ? 'bg-violet-600 text-white'
                : 'bg-game-card text-gray-400 border border-game-border'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Featured banner for gems */}
      {category === 'gems' && (
        <div className="mx-4 mb-3 rounded-xl bg-gradient-to-r from-violet-900 to-indigo-900 border border-violet-500/40 p-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💎</span>
            <div>
              <div className="text-sm font-bold text-white">Gem Bundles</div>
              <div className="text-xs text-violet-300">Gems unlock premium content, speed-ups, and rare pets!</div>
            </div>
          </div>
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-6">
        {filteredItems.map(item => {
          const isSkin = item.category === 'skins';
          const alreadyOwned = isSkin && ownedSkins.includes(item.value as string);
          const isReal = !!item.cost.real;
          const canAfford = isReal ? true :
            (item.cost.gold ? gold >= item.cost.gold : true) &&
            (item.cost.gems ? gems >= item.cost.gems : true);

          return (
            <div
              key={item.id}
              className="bg-game-card border border-game-border rounded-xl p-3 flex flex-col gap-2"
            >
              {/* Icon */}
              <div className="text-4xl text-center">{item.emoji}</div>

              {/* Name & description */}
              <div>
                <div className="text-xs font-bold text-white leading-tight">{item.name}</div>
                <div className="text-[10px] text-gray-400 leading-snug mt-0.5">{item.description}</div>
              </div>

              {/* Cost */}
              <div className="mt-auto">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {isReal ? (
                    <span className="text-sm font-bold text-green-400">${item.cost.real?.toFixed(2)}</span>
                  ) : (
                    <>
                      {item.cost.gold && (
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                          🪙 {item.cost.gold.toLocaleString()}
                        </span>
                      )}
                      {item.cost.gems && (
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${canAfford ? 'text-cyan-400' : 'text-red-400'}`}>
                          💎 {item.cost.gems}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <button
                  disabled={!canAfford || alreadyOwned}
                  onClick={() => buyShopItem(item.id)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition active:scale-95 ${
                    alreadyOwned
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : !canAfford
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : isReal
                      ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white'
                      : 'bg-violet-600 hover:bg-violet-500 text-white'
                  }`}
                >
                  {alreadyOwned ? '✓ Owned' : isReal ? `Buy $${item.cost.real?.toFixed(2)}` : 'Buy'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
