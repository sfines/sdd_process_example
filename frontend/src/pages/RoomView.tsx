import { useState } from 'react';
import { useSocketStore } from '../store/socketStore';
import RoomCodeDisplay from '../components/RoomCodeDisplay';
import PlayerList from '../components/PlayerList';
import DiceInput from '../components/DiceInput';
import RollHistory from '../components/RollHistory';

export default function RoomView() {
  const { roomCode, players, rollHistory, currentPlayerId, rollDice } =
    useSocketStore();
  const [isRolling, setIsRolling] = useState(false);

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading room...</div>
      </div>
    );
  }

  // Get current player's name
  const currentPlayer = players.find((p) => p.player_id === currentPlayerId);
  const playerName = currentPlayer?.name || 'Unknown';

  const handleRoll = (formula: string) => {
    setIsRolling(true);
    rollDice(formula, playerName, roomCode);

    // Reset rolling state after a short delay
    setTimeout(() => {
      setIsRolling(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Room Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Room</h1>
          <RoomCodeDisplay roomCode={roomCode} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Players Section */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
            <PlayerList
              players={players}
              currentPlayerId={currentPlayerId || ''}
            />
          </div>

          {/* Roll History Section */}
          <div className="md:col-span-2">
            <RollHistory rolls={rollHistory} />
          </div>
        </div>

        {/* Dice Rolling Section */}
        <DiceInput onRoll={handleRoll} isRolling={isRolling} />
      </div>
    </div>
  );
}
