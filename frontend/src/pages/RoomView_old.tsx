import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocketStore } from '../store/socketStore';
import { socket } from '../services/socket';
import RoomCodeDisplay from '../components/RoomCodeDisplay';
import PlayerList from '../components/PlayerList';
import DiceInput from '../components/DiceInput';
import RollHistory from '../components/RollHistory';

export default function RoomView() {
  // Get roomCode from URL (React Router provides this)
  const { roomCode } = useParams<{ roomCode: string }>();

  // Get room data from store (populated by polling)
  const players = useSocketStore((state) => state.players);
  const rollHistory = useSocketStore((state) => state.rollHistory);
  const currentPlayerId = useSocketStore((state) => state.currentPlayerId);
  const rollDice = useSocketStore((state) => state.rollDice);

  const [isRolling, setIsRolling] = useState(false);

  // Fetch initial room state ONLY if store is empty (direct URL navigation/refresh)
  // If we just created/joined, store already has state from room_created/room_joined
  useEffect(() => {
    if (roomCode && socket.connected && players.length === 0) {
      // No players means we navigated directly to URL, need to fetch state
      socket.emit('get_room_state', { room_code: roomCode });
    }
  }, [roomCode, players.length]);

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No room specified</div>
      </div>
    );
  }

  const handleRoll = (formula: string) => {
    // CRITICAL: Look up player name from players array using currentPlayerId
    const state = useSocketStore.getState();
    const currentPlayer = state.players.find((p) => p.player_id === state.currentPlayerId);
    const playerNameToSend = currentPlayer?.name || 'Unknown';
    
    // DEBUG: Log state at roll time to diagnose issue
    console.log('[RoomView handleRoll] State snapshot:', {
      currentPlayerId: state.currentPlayerId,
      playersCount: state.players.length,
      players: state.players,
      currentPlayer: currentPlayer,
      playerNameToSend: playerNameToSend,
    });
    
    setIsRolling(true);
    rollDice(formula, playerNameToSend, roomCode);

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
