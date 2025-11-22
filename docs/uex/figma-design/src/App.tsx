import React, { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { RoomView } from './components/RoomView';
import { PermalinkPage } from './components/PermalinkPage';

type Page = 'home' | 'room' | 'permalink';

interface AppState {
  page: Page;
  roomCode?: string;
  playerName?: string;
  rollId?: string;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({ page: 'home' });

  // Handle URL routing
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (path.startsWith('/roll/')) {
      const rollId = path.replace('/roll/', '');
      setAppState({ page: 'permalink', rollId });
    } else if (path.startsWith('/room/')) {
      const roomCode = path.replace('/room/', '');
      const playerName = searchParams.get('player');
      if (playerName) {
        setAppState({ page: 'room', roomCode, playerName });
      }
    }
  }, []);

  const navigateToRoom = (roomCode: string, playerName: string) => {
    window.history.pushState({}, '', `/room/${roomCode}?player=${encodeURIComponent(playerName)}`);
    setAppState({ page: 'room', roomCode, playerName });
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setAppState({ page: 'home' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {appState.page === 'home' && (
        <HomePage onNavigateToRoom={navigateToRoom} />
      )}
      {appState.page === 'room' && appState.roomCode && appState.playerName && (
        <RoomView 
          roomCode={appState.roomCode} 
          playerName={appState.playerName}
          onLeaveRoom={navigateToHome}
        />
      )}
      {appState.page === 'permalink' && appState.rollId && (
        <PermalinkPage rollId={appState.rollId} onNavigateHome={navigateToHome} />
      )}
    </div>
  );
}
