import { useState } from 'react';
import { Dices } from 'lucide-react';
import { useSocketStore } from '../store/socketStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const { createRoom, joinRoom, connectionError } = useSocketStore();

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header with Dices icon */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Dices className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              D&D Dice Roller
            </h1>
          </div>
          <p className="text-muted-foreground">Roll dice with your party</p>
        </div>

        {/* Create Room Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="playerName"
                className="block text-sm font-medium text-foreground mb-2"
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
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 20 characters
              </p>
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={isCreateButtonDisabled}
              className="w-full"
              size="lg"
            >
              Create Room
            </Button>

            {connectionError && (
              <div className="text-destructive text-sm">{connectionError}</div>
            )}
          </CardContent>
        </Card>

        {/* Join Room Section */}
        <Card>
          <CardHeader>
            <CardTitle>Join Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="roomCode"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Room Code
              </label>
              <Input
                id="roomCode"
                type="text"
                maxLength={20}
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g., ALPHA-1234"
              />
            </div>

            <div>
              <label
                htmlFor="joinPlayerName"
                className="block text-sm font-medium text-foreground mb-2"
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
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 20 characters
              </p>
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={isJoinButtonDisabled}
              className="w-full"
              size="lg"
              variant="secondary"
            >
              Join Room
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
