import { useGameStore } from '../../store/gameStore';

const TYPE_STYLES = {
  info: 'bg-blue-900/80 border-blue-500/50 text-blue-200',
  success: 'bg-green-900/80 border-green-500/50 text-green-200',
  warning: 'bg-yellow-900/80 border-yellow-500/50 text-yellow-200',
  error: 'bg-red-900/80 border-red-500/50 text-red-200',
};

export default function Notifications() {
  const notifications = useGameStore(s => s.notifications);
  const dismiss = useGameStore(s => s.dismissNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 flex flex-col gap-1.5 px-3 pointer-events-none">
      {notifications.map(n => (
        <div
          key={n.id}
          onClick={() => dismiss(n.id)}
          className={`pointer-events-auto text-xs font-medium border rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm transition-all ${TYPE_STYLES[n.type]}`}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
