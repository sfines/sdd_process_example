import React, { useState } from 'react';
import { Dices } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface HomePageProps {
  onNavigateToRoom: (roomCode: string, playerName: string) => void;
}

export function HomePage({ onNavigateToRoom }: HomePageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRoomCode = () => {
    const words = ['ALPHA', 'BRAVO', 'DELTA', 'ECHO', 'GAMMA', 'OMEGA', 'SIGMA', 'THETA'];
    const word = words[Math.floor(Math.random() * words.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${word}-${number}`;
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim() || playerName.length > 20) {
      setError('Player name must be 1-20 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newRoomCode = generateRoomCode();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomCode: newRoomCode,
            playerName: playerName.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create room');
      }

      setCreatedRoomCode(newRoomCode);
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || playerName.length > 20) {
      setError('Player name must be 1-20 characters');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/join`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomCode: roomCode.toUpperCase().trim(),
            playerName: playerName.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join room');
      }

      onNavigateToRoom(roomCode.toUpperCase().trim(), playerName.trim());
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${createdRoomCode}`;
    navigator.clipboard.writeText(link);
  };

  const formatRoomCode = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (cleaned.length <= 4) return cleaned;
    return `${cleaned.slice(0, cleaned.search(/\d/) || 4)}-${cleaned.slice(cleaned.search(/\d/) || 4)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4">
              <Dices className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-slate-100 mb-2">D&D Dice Roller</h1>
            <p className="text-slate-400">Roll dice together in real-time</p>
          </div>

          {/* Primary Actions */}
          <div className="space-y-3">
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              size="lg"
            >
              Create Room
            </Button>
            <Button 
              onClick={() => setShowJoinModal(true)}
              variant="outline"
              className="w-full h-14 border-2 border-slate-700 text-slate-100 hover:bg-slate-800"
              size="lg"
            >
              Join Room
            </Button>
          </div>

          {/* Connection Status */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Connected</span>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
          </DialogHeader>
          
          {!createdRoomCode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-slate-300">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  disabled={loading}
                />
                <p className="text-xs text-slate-400 mt-1">{playerName.length}/20 characters</p>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-950/50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleCreateRoom}
                disabled={loading || !playerName.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Room Code</p>
                <div className="text-3xl font-mono bg-slate-800 p-4 rounded-lg border border-slate-700">
                  {createdRoomCode}
                </div>
              </div>

              <Button
                onClick={copyRoomLink}
                variant="outline"
                className="w-full border-slate-700 hover:bg-slate-800"
              >
                Copy Room Link
              </Button>

              <Button
                onClick={() => onNavigateToRoom(createdRoomCode, playerName.trim())}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Enter Room
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Join Room Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Join Room</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-slate-300">Room Code</label>
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(formatRoomCode(e.target.value))}
                placeholder="ALPHA-1234"
                className="bg-slate-800 border-slate-700 text-slate-100 font-mono"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-slate-300">Your Name</label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                placeholder="Enter your name"
                maxLength={20}
                className="bg-slate-800 border-slate-700 text-slate-100"
                disabled={loading}
              />
              <p className="text-xs text-slate-400 mt-1">{playerName.length}/20 characters</p>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-950/50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              onClick={handleJoinRoom}
              disabled={loading || !playerName.trim() || !roomCode.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
