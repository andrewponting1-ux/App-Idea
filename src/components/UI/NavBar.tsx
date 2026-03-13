import { useGameStore } from '../../store/gameStore';
import { ActiveView } from '../../types';

const TABS: { id: ActiveView; label: string; emoji: string }[] = [
  { id: 'base', label: 'Base', emoji: '🏡' },
  { id: 'collection', label: 'Pets', emoji: '🐾' },
  { id: 'battle', label: 'Battle', emoji: '⚔️' },
  { id: 'breeding', label: 'Breed', emoji: '💕' },
  { id: 'shop', label: 'Shop', emoji: '🛒' },
];

export default function NavBar() {
  const activeView = useGameStore(s => s.activeView);
  const setActiveView = useGameStore(s => s.setActiveView);
  const breedingTasks = useGameStore(s => s.breedingTasks);
  const readyTasks = breedingTasks.filter(t => t.completed).length;

  return (
    <nav className="flex bg-game-card border-t border-game-border safe-bottom">
      {TABS.map(tab => {
        const isActive = activeView === tab.id;
        const badge = tab.id === 'breeding' && readyTasks > 0 ? readyTasks : null;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 pt-3 gap-0.5 transition-all relative ${
              isActive
                ? 'text-violet-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-violet-500 rounded-full" />
            )}
            <span className={`text-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
              {tab.emoji}
            </span>
            <span className="text-[10px] font-semibold">{tab.label}</span>
            {badge && (
              <span className="absolute top-1.5 right-2 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
