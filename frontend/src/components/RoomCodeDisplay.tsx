import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface RoomCodeDisplayProps {
  roomCode: string;
  compact?: boolean;
}

export default function RoomCodeDisplay({ roomCode, compact = false }: RoomCodeDisplayProps) {
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

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="font-mono text-sm px-3 py-1"
          data-testid="room-code"
        >
          {roomCode}
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
        >
          <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-muted-foreground'}`} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-muted rounded-lg p-4">
      <div className="flex-1">
        <div className="text-sm text-muted-foreground mb-1">Room Code</div>
        <div
          className="text-3xl font-mono font-bold tracking-wider"
          data-testid="room-code"
        >
          {roomCode}
        </div>
      </div>
      <Button
        onClick={handleCopy}
        size="lg"
      >
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  );
}
