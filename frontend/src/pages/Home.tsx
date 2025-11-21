import { useState } from 'react';
import useSocketStore from '../store/socketStore';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const { createRoom, connectionError } = useSocketStore();

  const handleCreateRoom = () => {
    if (playerName.trim().length === 0) {
      return;
    }
    createRoom(playerName);
  };

  const isButtonDisabled = playerName.trim().length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            D&D Dice Roller
          </h1>
          <p className="text-gray-600">Roll dice with your party</p>
        </div>

        {/* Create Room Section */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Create Room</h2>
          
          <div>
            <label 
              htmlFor="playerName" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              maxLength={20}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum 20 characters
            </p>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={isButtonDisabled}
            className="w-full h-12 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            style={{ minHeight: '48px' }}
          >
            Create Room
          </button>

          {connectionError && (
            <div className="text-red-600 text-sm">
              {connectionError}
            </div>
          )}
        </div>

        {/* Join Room Section (Placeholder for Story 2.2) */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4 opacity-50">
          <h2 className="text-xl font-semibold text-gray-800">Join Room</h2>
          <p className="text-gray-600 text-sm">Coming soon in Story 2.2</p>
        </div>
      </div>
    </div>
  );
}
