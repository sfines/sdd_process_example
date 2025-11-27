import React, { useState } from 'react';
import { X, LogOut, AlertTriangle, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import type { Player, RoomData } from './RoomView';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface RoomSettingsProps {
  roomData: RoomData;
  currentPlayerName: string;
  isCreator: boolean;
  players: Player[];
  onClose: () => void;
  onLeaveRoom: () => void;
  onRoomUpdated: () => void;
}

export function RoomSettings({ 
  roomData, 
  currentPlayerName,
  isCreator, 
  players,
  onClose, 
  onLeaveRoom,
  onRoomUpdated 
}: RoomSettingsProps) {
  const [showPromoteToDM, setShowPromoteToDM] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePromoteToDM = async () => {
    if (!selectedPlayer) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/${roomData.roomCode}/promote`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dmName: selectedPlayer,
          }),
        }
      );

      if (response.ok) {
        onRoomUpdated();
        setShowPromoteToDM(false);
        onClose();
      }
    } catch (err) {
      console.error('Error promoting to DM:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRoom = async () => {
    if (!confirm('Are you sure you want to close this room? All players will be disconnected.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/${roomData.roomCode}/close`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        onLeaveRoom();
      }
    } catch (err) {
      console.error('Error closing room:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const eligiblePlayers = players.filter(p => p.isOnline && p.name !== currentPlayerName);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle>Room Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Room Info */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Room Code:</span>
              <span className="font-mono text-slate-100">{roomData.roomCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Mode:</span>
              <span className="text-slate-100 capitalize">
                {roomData.mode === 'dm-led' ? 'DM-Led' : 'Open'}
              </span>
            </div>
            {roomData.dm && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">DM:</span>
                <span className="text-slate-100">{roomData.dm}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Created:</span>
              <span className="text-slate-100">{formatDate(roomData.createdAt)}</span>
            </div>
          </div>

          {/* Promote to DM (Creator only, Open rooms only) */}
          {isCreator && roomData.mode === 'open' && (
            <Button
              onClick={() => setShowPromoteToDM(true)}
              variant="outline"
              className="w-full border-slate-700 hover:bg-slate-800"
            >
              <Crown className="w-4 h-4 mr-2" />
              Promote to DM-Led
            </Button>
          )}

          {/* Leave Room */}
          <Button
            onClick={onLeaveRoom}
            variant="outline"
            className="w-full border-slate-700 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Room
          </Button>

          {/* Close Room (Creator only) */}
          {isCreator && (
            <Button
              onClick={handleCloseRoom}
              disabled={loading}
              variant="outline"
              className="w-full border-red-800 text-red-400 hover:bg-red-950/30 hover:border-red-700"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {loading ? 'Closing...' : 'Close Room'}
            </Button>
          )}
        </div>

        {/* Promote to DM Modal */}
        {showPromoteToDM && (
          <Dialog open={showPromoteToDM} onOpenChange={setShowPromoteToDM}>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
              <DialogHeader>
                <DialogTitle>Promote to DM-Led</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Select a player to become the Dungeon Master. DMs can make hidden rolls and set difficulty checks.
                </p>

                {eligiblePlayers.length === 0 ? (
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center text-slate-400">
                    No other players online
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eligiblePlayers.map((player) => (
                      <div
                        key={player.name}
                        onClick={() => setSelectedPlayer(player.name)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPlayer === player.name
                            ? 'bg-purple-950/30 border-purple-600'
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        {player.name}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowPromoteToDM(false)}
                    variant="outline"
                    className="flex-1 border-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePromoteToDM}
                    disabled={!selectedPlayer || loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Promoting...' : 'Confirm'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
