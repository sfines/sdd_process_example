import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, LogOut, Users } from 'lucide-react';
import { useSocketStore } from '../store/socketStore';
import { socket } from '../services/socket';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import RoomCodeDisplay from '../components/RoomCodeDisplay';
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
      const padding = 40; // Additional padding/gaps

      const availableHeight =
        viewportHeight -
        headerHeight -
        roomCodeHeight -
        separatorHeight -
        cardHeaderHeight -
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Sticky Bar - Figma Design */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Left: Room Code */}
          <div className="flex items-center gap-2">
            <RoomCodeDisplay roomCode={roomCode} compact />
          </div>

          {/* Right: Connection Status and Leave */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-500 hidden sm:inline">Offline</span>
                </>
              )}
            </div>
            <Button
              onClick={handleLeaveRoom}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Centered Single Column */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Dice Roller */}
        <Card>
          <CardHeader>
            <CardTitle>Roll Dice</CardTitle>
          </CardHeader>
          <CardContent>
            <DiceInput onRoll={handleRoll} isRolling={isRolling} />
          </CardContent>
        </Card>

        {/* Roll History */}
        <Card>
          <CardHeader>
            <CardTitle>Roll History</CardTitle>
          </CardHeader>
          <CardContent>
            <VirtualRollHistory
              rolls={rollHistory}
              height={rollHistoryHeight}
              shouldAutoScroll={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Player List Drawer - Figma Design */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className={`max-w-4xl mx-auto transition-transform duration-300 ${
          showPlayerList ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <Card className="rounded-t-lg rounded-b-none border-b-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Players</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlayerList(false)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <PlayerList players={players} currentPlayerId={currentPlayerId} compact />
            </CardContent>
          </Card>
        </div>

        {!showPlayerList && (
          <button
            onClick={() => setShowPlayerList(true)}
            className="w-full max-w-4xl mx-auto bg-background border-t border-border px-4 py-3 flex items-center justify-center gap-2 hover:bg-accent transition-colors"
          >
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {players.length} player{players.length !== 1 ? 's' : ''} online
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
