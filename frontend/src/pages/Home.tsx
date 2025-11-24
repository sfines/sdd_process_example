import { useState } from 'react';
import { Dices } from 'lucide-react';
import { useSocketStore } from '../store/socketStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const { createRoom, joinRoom, connectionError, isConnected } = useSocketStore();

  const handleCreateRoom = () => {
    if (playerName.trim().length === 0) {
      return;
    }
    createRoom(playerName);
  };

  const handleJoinRoom = () => {
    if (
      joinRoomCode.trim().length === 0 ||
      joinPlayerName.trim().length === 0
    ) {
      return;
    }
    joinRoom(joinRoomCode, joinPlayerName);
  };

  const isCreateButtonDisabled = playerName.trim().length === 0;
  const isJoinButtonDisabled =
    joinRoomCode.trim().length === 0 || joinPlayerName.trim().length === 0;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4">
              <Dices className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              D&D Dice Roller
            </h1>
            <p className="text-slate-400">Roll dice together in real-time</p>
          </div>

          {!showJoinForm ? (
            /* Main Menu */
            <div className="space-y-6">
              {/* Create Room Section */}
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="playerName"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Your Name
                  </label>
                  <Input
                    id="playerName"
                    type="text"
                    maxLength={20}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {playerName.length}/20 characters
                  </p>
                </div>

                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreateButtonDisabled}
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  size="lg"
                >
                  Create Room
                </Button>
              </div>

              {/* Join Room Button */}
              <Button
                onClick={() => setShowJoinForm(true)}
                variant="outline"
                className="w-full h-14 border-2 border-slate-700 text-slate-100 hover:bg-slate-800"
                size="lg"
              >
                Join Room
              </Button>

              {connectionError && (
                <div className="text-sm text-red-400 bg-red-950/50 p-3 rounded-lg">
                  {connectionError}
                </div>
              )}

              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          ) : (
            /* Join Room Form */
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="roomCode"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Room Code
                </label>
                <Input
                  id="roomCode"
                  type="text"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  placeholder="ALPHA-1234"
                  className="bg-slate-800 border-slate-700 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="joinPlayerName"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Your Name
                </label>
                <Input
                  id="joinPlayerName"
                  type="text"
                  maxLength={20}
                  value={joinPlayerName}
                  onChange={(e) => setJoinPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {joinPlayerName.length}/20 characters
                </p>
              </div>

              {connectionError && (
                <div className="text-sm text-red-400 bg-red-950/50 p-3 rounded-lg">
                  {connectionError}
                </div>
              )}

              <Button
                onClick={handleJoinRoom}
                disabled={isJoinButtonDisabled}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                size="lg"
              >
                Join Room
              </Button>

              <Button
                onClick={() => setShowJoinForm(false)}
                variant="outline"
                className="w-full border-slate-700 text-slate-100 hover:bg-slate-800"
              >
                Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
