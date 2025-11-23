/**
 * PlayerList Component
 *
 * Displays the list of players in a room with Figma design.
 * Card-based collapsible drawer with player badges and connection status.
 */

import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Player {
  player_id: string;
  name: string;
  connected: boolean;
}

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string | null;
}

export default function PlayerList({
  players,
  currentPlayerId,
}: PlayerListProps): JSX.Element {
  // Count online players
  const onlineCount = players.filter((p) => p.connected).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Players ({onlineCount}/{players.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No players yet
          </p>
        ) : (
          <div className="space-y-2">
            {players.map((player) => {
              const isCurrentPlayer = player.player_id === currentPlayerId;

              return (
                <div
                  key={player.player_id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  data-testid={`player-${player.name}`}
                >
                  {/* Connection status indicator */}
                  <div
                    className={`w-2 h-2 rounded-full ${
                      player.connected ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    aria-label={
                      player.connected ? 'Connected' : 'Disconnected'
                    }
                  />

                  {/* Player name */}
                  <span className="flex-1">
                    {player.name}
                  </span>

                  {/* Current player badge */}
                  {isCurrentPlayer && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}

                  {/* Online/Offline badge */}
                  <Badge
                    variant={player.connected ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {player.connected ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
