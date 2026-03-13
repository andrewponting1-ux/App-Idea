import { useEffect, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import ResourceBar from './components/UI/ResourceBar';
import NavBar from './components/UI/NavBar';
import Notifications from './components/UI/Notifications';
import BaseView from './components/Base/BaseView';
import CollectionView from './components/Collection/CollectionView';
import BattleView from './components/Battle/BattleView';
import BreedingView from './components/Breeding/BreedingView';
import ShopView from './components/Shop/ShopView';

export default function App() {
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

  return (
    <div className="flex flex-col h-full max-w-sm mx-auto bg-game-bg">
      <ResourceBar />
      <Notifications />
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeView === 'base' && <BaseView />}
        {activeView === 'collection' && <CollectionView />}
        {activeView === 'battle' && <BattleView />}
        {activeView === 'breeding' && <BreedingView />}
        {activeView === 'shop' && <ShopView />}
      </main>
      <NavBar />
    </div>
  );
}
