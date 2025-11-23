import React from 'react';
import { X, Crown, Shield, UserX } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Player, RoomData } from './RoomView';

interface PlayerListProps {
  players: Player[];
  roomData: RoomData | null;
  currentPlayerName: string;
  isCreator: boolean;
  onClose: () => void;
}

export function PlayerList({ players, roomData, currentPlayerName, isCreator, onClose }: PlayerListProps) {
  const onlinePlayers = players.filter(p => p.isOnline);
  const offlinePlayers = players.filter(p => !p.isOnline);

  return (
    <div className="bg-slate-900 border-t border-slate-800 shadow-2xl max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-slate-100">Players</h3>
          <p className="text-sm text-slate-400">
            {onlinePlayers.length} online, {offlinePlayers.length} offline
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Online Players */}
      {onlinePlayers.length > 0 && (
        <div className="p-4 space-y-2">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Online</div>
          {onlinePlayers.map((player) => (
            <PlayerItem
              key={player.name}
              player={player}
              roomData={roomData}
              currentPlayerName={currentPlayerName}
              isCreator={isCreator}
            />
          ))}
        </div>
      )}

      {/* Offline Players */}
      {offlinePlayers.length > 0 && (
        <div className="p-4 space-y-2 border-t border-slate-800">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Offline</div>
          {offlinePlayers.map((player) => (
            <PlayerItem
              key={player.name}
              player={player}
              roomData={roomData}
              currentPlayerName={currentPlayerName}
              isCreator={isCreator}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerItem({ 
  player, 
  roomData, 
  currentPlayerName, 
  isCreator 
}: { 
  player: Player; 
  roomData: RoomData | null;
  currentPlayerName: string;
  isCreator: boolean;
}) {
  const isCurrentPlayer = player.name === currentPlayerName;
  const isRoomCreator = player.name === roomData?.creator;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors">
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className={`w-2 h-2 rounded-full ${player.isOnline ? 'bg-green-500' : 'bg-slate-600'}`} />
        
        {/* Player Name */}
        <span className={`${player.isOnline ? 'text-slate-100' : 'text-slate-500'}`}>
          {player.name}
        </span>

        {/* Badges */}
        <div className="flex items-center gap-1">
          {isCurrentPlayer && (
            <Badge variant="outline" className="text-xs border-purple-600/50 bg-purple-950/30 text-purple-300">
              You
            </Badge>
          )}
          {isRoomCreator && (
            <Badge variant="outline" className="text-xs border-amber-600/50 bg-amber-950/30 text-amber-300">
              <Crown className="w-3 h-3 mr-1" />
              Creator
            </Badge>
          )}
          {player.isDM && (
            <Badge variant="outline" className="text-xs border-blue-600/50 bg-blue-950/30 text-blue-300">
              <Shield className="w-3 h-3 mr-1" />
              DM
            </Badge>
          )}
        </div>
      </div>

      {/* Kick Button (Creator only, can't kick self) */}
      {isCreator && !isCurrentPlayer && (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/30"
          onClick={() => {
            if (confirm(`Kick ${player.name} from the room?`)) {
              // TODO: Implement kick functionality
              console.log('Kick player:', player.name);
            }
          }}
        >
          <UserX className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
