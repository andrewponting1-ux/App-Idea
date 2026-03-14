import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import ResourceBar from './components/UI/ResourceBar';
import NavBar from './components/UI/NavBar';
import Notifications from './components/UI/Notifications';
import BaseView from './components/Base/BaseView';
import CollectionView from './components/Collection/CollectionView';
import BattleView from './components/Battle/BattleView';
import BreedingView from './components/Breeding/BreedingView';
import ShopView from './components/Shop/ShopView';
import LoadingScreen from './components/UI/LoadingScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const activeView = useGameStore(s => s.activeView);
  const gameTick = useGameStore(s => s.gameTick);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Run a tick immediately on mount to process offline time
    gameTick();

    // Then tick every 5 seconds
    tickRef.current = setInterval(() => {
      gameTick();
    }, 5000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [gameTick]);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-game-bg">
      <ResourceBar />
      <Notifications />
      {/* relative wrapper gives NavBar its absolute positioning context */}
      <div className="flex-1 relative overflow-hidden">
        <main className="h-full overflow-hidden flex flex-col">
          {activeView === 'base' && <BaseView />}
          {activeView === 'collection' && <CollectionView />}
          {activeView === 'battle' && <BattleView />}
          {activeView === 'breeding' && <BreedingView />}
          {activeView === 'shop' && <ShopView />}
        </main>
        <NavBar />
      </div>
    </div>
  );
}
