import { useGameStore } from '../../store/gameStore';

export default function ResourceBar() {
  const gold = useGameStore(s => s.gold);
  const gems = useGameStore(s => s.gems);
  const food = useGameStore(s => s.food);

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{
        background: 'linear-gradient(to bottom, #2a1e0c, #1a1208)',
        borderBottom: '2px solid #6b4f1a',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,150,60,0.15)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-1.5">
        <span className="text-lg">⚔️</span>
        <span
          className="text-sm font-black tracking-wide"
          style={{ color: '#f5a623', textShadow: '0 -1px 0 rgba(0,0,0,0.5), 0 0 8px rgba(245,166,35,0.4)' }}
        >
          PetRealm
        </span>
      </div>

      {/* Resources */}
      <div className="flex gap-2">
        <Chip emoji="🪙" value={Math.floor(gold)} />
        <Chip emoji="💎" value={Math.floor(gems)} />
        <Chip emoji="🍖" value={Math.floor(food)} />
      </div>
    </div>
  );
}

function Chip({ emoji, value }: { emoji: string; value: number }) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{
        background: 'linear-gradient(to bottom, #3a2a10, #241808)',
        border: '1px solid #6b4f1a',
        boxShadow: 'inset 0 1px 0 rgba(200,150,60,0.12)',
      }}
    >
      <span className="text-xs">{emoji}</span>
      <span className="text-xs font-bold" style={{ color: '#ffd166' }}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}
