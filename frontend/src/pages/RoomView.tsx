import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useSocketStore } from '../store/socketStore';
import { socket } from '../services/socket';
import { Button } from '../components/ui/button';
import Header from '../components/Header';
import NavigationDrawer from '../components/NavigationDrawer';
import PlayerList from '../components/PlayerList';
import DiceInput from '../components/DiceInput';
import VirtualRollHistory from '../components/VirtualRollHistory';

export default function RoomView() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  // Get data from Zustand store (populated by useSocket in App.tsx)
  const players = useSocketStore((state) => state.players);
  const rollHistory = useSocketStore((state) => state.rollHistory);
  const currentPlayerId = useSocketStore((state) => state.currentPlayerId);
  const isConnected = useSocketStore((state) => state.isConnected);
  const rollDice = useSocketStore((state) => state.rollDice);

  const [isRolling, setIsRolling] = useState(false);
  const [rollHistoryHeight, setRollHistoryHeight] = useState(400); // Default 400px

  // Calculate available height for roll history based on viewport
  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 80; // Approx height of header section
      const roomCodeHeight = 60; // Room code display
      const separatorHeight = 24; // Separator margin
      const cardHeaderHeight = 60; // Card header with title
      const bottomDrawerHeight = 60; // Player drawer button height
      const padding = 60; // Additional padding/gaps

      const availableHeight =
        viewportHeight -
        headerHeight -
        roomCodeHeight -
        separatorHeight -
        cardHeaderHeight -
        bottomDrawerHeight -
        padding;

      // Minimum 300px, maximum 800px
      const clampedHeight = Math.max(300, Math.min(800, availableHeight));
      setRollHistoryHeight(clampedHeight);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">No room specified</div>
      </div>
    );
  }

  const handleRoll = (formula: string) => {
    // Get fresh player name from store at roll time
    const freshPlayerName = useSocketStore.getState().currentPlayerName || 'Unknown';

    console.log('[RoomView] Rolling with:', {
      formula,
      playerName: freshPlayerName,
      currentPlayerId,
      roomCode,
    });

    setIsRolling(true);
    rollDice(formula, freshPlayerName, roomCode);

    setTimeout(() => {
      setIsRolling(false);
    }, 500);
  };

  const handleLeaveRoom = () => {
    // Disconnect and navigate home
    socket.disconnect();
    navigate('/');
  };

  const [showPlayerList, setShowPlayerList] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Navigation drawer state

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Responsive Header Component */}
      <Header
        roomCode={roomCode}
        isConnected={isConnected}
        onLeaveRoom={handleLeaveRoom}
        onMenuToggle={() => setIsDrawerOpen(true)}
        showMenuButton={true}
      />

      {/* Mobile Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        roomCode={roomCode}
        playerName={
          useSocketStore.getState().currentPlayerName || 'Unknown Player'
        }
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Main Content - Centered Single Column */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6 pb-32">{/* Increased pb-24 to pb-32 for player drawer */}
        {/* Dice Roller */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <DiceInput onRoll={handleRoll} isRolling={isRolling} />
        </div>

        {/* Roll History */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Roll History</h2>
          <VirtualRollHistory
            rolls={rollHistory}
            height={rollHistoryHeight}
            shouldAutoScroll={true}
          />
        </div>
      </div>

      {/* Bottom Player List Drawer - Figma Design */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div
          className={`max-w-4xl mx-auto transition-transform duration-300 ${
            showPlayerList ? 'translate-y-0' : 'translate-y-full'
          } ${!showPlayerList ? 'pointer-events-none' : ''}`}
        >
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-slate-100">Players</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlayerList(false)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100"
              >
                ✕
              </Button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              <PlayerList
                players={players}
                currentPlayerId={currentPlayerId}
                compact
              />
            </div>
          </div>
        </div>

        {!showPlayerList && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowPlayerList(true)}
              className="w-full max-w-4xl bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-100">
                {players.length} player{players.length !== 1 ? 's' : ''} online
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
