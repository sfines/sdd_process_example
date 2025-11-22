import { useState } from 'react';

interface RoomCodeDisplayProps {
  roomCode: string;
}

export default function RoomCodeDisplay({ roomCode }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-4">
      <div className="flex-1">
        <div className="text-sm text-gray-600 mb-1">Room Code</div>
        <div
          className="text-3xl font-mono font-bold text-gray-900 tracking-wider"
          data-testid="room-code"
        >
          {roomCode}
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
        style={{ minHeight: '48px' }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
