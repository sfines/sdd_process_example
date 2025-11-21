/**
 * PlayerList Component
 *
 * Displays the list of players in a room with their connection status.
 */

interface Player {
  player_id: string;
  name: string;
  connected: boolean;
}

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
}

export default function PlayerList({
  players,
  currentPlayerId,
}: PlayerListProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Players</h2>
      
      {players.length === 0 ? (
        <p className="text-gray-500 text-sm">No players yet</p>
      ) : (
        <ul className="space-y-2" role="list">
          {players.map((player) => {
            const isCurrentPlayer = player.player_id === currentPlayerId;
            
            return (
              <li
                key={player.player_id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                style={{ minHeight: '44px' }}
              >
                {/* Connection status indicator */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    player.connected ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  aria-label={player.connected ? 'Connected' : 'Disconnected'}
                />
                
                {/* Player name */}
                <span className="flex-1 text-gray-800">
                  {player.name}
                  {isCurrentPlayer && (
                    <span className="ml-2 text-sm text-blue-600 font-medium">
                      (You)
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
