import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocketStore } from '../store/socketStore';
import { socket } from '../services/socket';
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
  const rollDice = useSocketStore((state) => state.rollDice);
  
  const [isRolling, setIsRolling] = useState(false);

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No room specified</div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Game Room</h1>
            <p className="text-gray-600 mt-1">
              Playing as: {currentPlayerName || 'Unknown'}
            </p>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Leave Room
          </button>
        </div>

        {/* Room Code Display */}
        <div className="mb-6">
          <RoomCodeDisplay roomCode={roomCode} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Dice Roller & Player List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dice Input */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Roll Dice
              </h2>
              <DiceInput onRoll={handleRoll} isRolling={isRolling} />
            </div>

            {/* Player List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Players ({players.length})
              </h2>
              <PlayerList players={players} currentPlayerId={currentPlayerId} />
            </div>
          </div>

          {/* Right Column - Roll History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Roll History
              </h2>
              <RollHistory rolls={rollHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
