import { useSocketStore } from '../store/socketStore';
import RoomCodeDisplay from '../components/RoomCodeDisplay';
import PlayerList from '../components/PlayerList';

export default function RoomView() {
  const { roomCode, players, rollHistory, currentPlayerId } = useSocketStore();

  if (!roomCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading room...</div>
      </div>
    );
  }

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
            <PlayerList players={players} currentPlayerId={currentPlayerId || ''} />
          </div>

          {/* Roll History Section */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Roll History
            </h2>
            <div className="space-y-2">
              {rollHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No rolls yet. Roll some dice to get started!
                </p>
              ) : (
                <div className="text-gray-500 text-sm">
                  Roll history will appear here (Story 2.3+)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dice Rolling Section - Placeholder for Story 2.3 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Dice Roller
          </h2>
          <p className="text-gray-500 text-sm">
            Coming in Story 2.3 - Roll dice functionality
          </p>
        </div>
      </div>
    </div>
  );
}
