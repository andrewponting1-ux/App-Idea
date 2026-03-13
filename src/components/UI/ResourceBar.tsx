import { useGameStore } from '../../store/gameStore';

export default function ResourceBar() {
  const gold = useGameStore(s => s.gold);
  const gems = useGameStore(s => s.gems);
  const food = useGameStore(s => s.food);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-game-card border-b border-game-border">
      <div className="flex items-center gap-1 text-sm font-bold">
        <span>🏠</span>
        <span className="text-violet-300 text-xs font-bold tracking-wide">PetRealm</span>
      </div>
      <div className="flex gap-3">
        <Chip emoji="🪙" value={Math.floor(gold)} color="text-yellow-400" />
        <Chip emoji="💎" value={Math.floor(gems)} color="text-cyan-400" />
        <Chip emoji="🍖" value={Math.floor(food)} color="text-green-400" />
      </div>
    </div>
  );
}

function Chip({ emoji, value, color }: { emoji: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-0.5">
      <span className="text-xs">{emoji}</span>
      <span className={`text-xs font-bold ${color}`}>{value.toLocaleString()}</span>
    </div>
  );
}
