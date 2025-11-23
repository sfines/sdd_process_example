import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, LogOut } from 'lucide-react';
import { useSocketStore } from '../store/socketStore';
import { socket } from '../services/socket';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import RoomCodeDisplay from '../components/RoomCodeDisplay';
import PlayerList from '../components/PlayerList';
import DiceInput from '../components/DiceInput';
import RollHistory from '../components/RollHistory';

export default function RoomView() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  // Get data from Zustand store (populated by useSocket in App.tsx)
  const players = useSocketStore((state) => state.players);
  const rollHistory = useSocketStore((state) => state.rollHistory);
  const currentPlayerId = useSocketStore((state) => state.currentPlayerId);
  const currentPlayerName = useSocketStore((state) => state.currentPlayerName);
  const isConnected = useSocketStore((state) => state.isConnected);
  const rollDice = useSocketStore((state) => state.rollDice);

  const [isRolling, setIsRolling] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header with Connection Status */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Game Room</h1>
              <p className="text-muted-foreground mt-1">
                Playing as: {currentPlayerName || 'Unknown'}
              </p>
            </div>
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" aria-label="Connected" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" aria-label="Disconnected" />
              )}
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <Button
            onClick={handleLeaveRoom}
            variant="outline"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Room
          </Button>
        </div>

        {/* Room Code Display */}
        <div className="mb-6">
          <RoomCodeDisplay roomCode={roomCode} />
        </div>

        <Separator className="mb-6" />

        {/* Main Content Grid - Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Player List */}
          <div className="lg:col-span-1 space-y-6">
            <PlayerList players={players} currentPlayerId={currentPlayerId} />
          </div>

          {/* Center Column - Dice Roller */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Roll Dice</CardTitle>
              </CardHeader>
              <CardContent>
                <DiceInput onRoll={handleRoll} isRolling={isRolling} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Roll History */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Roll History</CardTitle>
              </CardHeader>
              <CardContent>
                <RollHistory rolls={rollHistory} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
