import { useGameStore } from '../../store/gameStore';
import { ActiveView } from '../../types';

const TABS: { id: ActiveView; label: string; emoji: string }[] = [
  { id: 'base',       label: 'Base',   emoji: '🏡' },
  { id: 'collection', label: 'Pets',   emoji: '🐾' },
  { id: 'battle',     label: 'Battle', emoji: '⚔️' },
  { id: 'breeding',   label: 'Breed',  emoji: '💕' },
  { id: 'shop',       label: 'Shop',   emoji: '🛒' },
];

export default function NavBar() {
  const activeView    = useGameStore(s => s.activeView);
  const setActiveView = useGameStore(s => s.setActiveView);
  const breedingTasks = useGameStore(s => s.breedingTasks);
  const readyTasks    = breedingTasks.filter(t => t.completed).length;

  return (
    <nav
      style={{
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 50,
      }}
    >
      {TABS.map(tab => {
        const isActive = activeView === tab.id;
        const badge = tab.id === 'breeding' && readyTasks > 0 ? readyTasks : null;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: isActive
                ? 'linear-gradient(145deg, #f8d040, #e07a08)'
                : 'linear-gradient(145deg, rgba(38,24,8,0.94), rgba(16,10,2,0.94))',
              border: `2.5px solid ${isActive ? '#f5a623' : '#4a3010'}`,
              boxShadow: isActive
                ? '0 0 16px rgba(245,166,35,0.65), 0 3px 0 #7a3a00'
                : '0 3px 0 #0a0500, inset 0 1px 0 rgba(255,190,40,0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'box-shadow 0.15s, border-color 0.15s, background 0.15s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1, pointerEvents: 'none' }}>
              {tab.emoji}
            </span>
            <span style={{
              fontSize: 8,
              color: isActive ? '#3a1800' : '#9a7840',
              fontWeight: 800,
              letterSpacing: 0.3,
              marginTop: 2,
              lineHeight: 1,
              pointerEvents: 'none',
              fontFamily: 'sans-serif',
            }}>
              {tab.label.toUpperCase()}
            </span>

            {badge && (
              <span style={{
                position: 'absolute',
                top: -5,
                right: -5,
                minWidth: 18,
                height: 18,
                padding: '0 3px',
                background: '#ef4444',
                border: '2px solid #1a0800',
                borderRadius: 9,
                fontSize: 9,
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
