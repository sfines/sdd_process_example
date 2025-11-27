import React, { useState, useEffect, useRef } from 'react';
import { Copy, Settings, Users, Wifi, WifiOff } from 'lucide-react';
import { DiceRoller } from './DiceRoller';
import { RollHistory } from './RollHistory';
import { PlayerList } from './PlayerList';
import { RoomSettings } from './RoomSettings';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface RoomViewProps {
  roomCode: string;
  playerName: string;
  onLeaveRoom: () => void;
}

export interface Roll {
  id: string;
  playerName: string;
  timestamp: number;
  diceFormula: string;
  diceResults: number[];
  modifier: number;
  total: number;
  advantage?: 'advantage' | 'disadvantage';
  advantageRolls?: number[];
  isHidden?: boolean;
  revealedBy?: string;
  dc?: number;
}

export interface Player {
  name: string;
  isOnline: boolean;
  isDM?: boolean;
}

export interface RoomData {
  roomCode: string;
  mode: 'open' | 'dm-led';
  dm?: string;
  dc?: number;
  createdAt: number;
  creator: string;
}

export function RoomView({ roomCode, playerName, onLeaveRoom }: RoomViewProps) {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [copied, setCopied] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch room data
  const fetchRoomData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/${roomCode}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoomData(data);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error fetching room data:', err);
      setIsConnected(false);
    }
  };

  // Fetch rolls
  const fetchRolls = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/${roomCode}/rolls`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRolls(data.rolls || []);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error fetching rolls:', err);
      setIsConnected(false);
    }
  };

  // Fetch players
  const fetchPlayers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/${roomCode}/players`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error fetching players:', err);
      setIsConnected(false);
    }
  };

  // Update player presence
  const updatePresence = async () => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/${roomCode}/presence`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerName }),
        }
      );
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  };

  // Set up polling
  useEffect(() => {
    fetchRoomData();
    fetchRolls();
    fetchPlayers();
    updatePresence();

    // Poll for updates every 2 seconds
    pollInterval.current = setInterval(() => {
      fetchRolls();
      fetchPlayers();
      updatePresence();
    }, 2000);

    // Update presence every 5 seconds
    const presenceInterval = setInterval(updatePresence, 5000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      clearInterval(presenceInterval);
    };
  }, [roomCode, playerName]);

  const handleRoll = async (rollData: Omit<Roll, 'id' | 'timestamp'>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/${roomCode}/roll`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rollData),
        }
      );

      if (response.ok) {
        // Immediately fetch new rolls
        fetchRolls();
      }
    } catch (err) {
      console.error('Error creating roll:', err);
    }
  };

  const handleRevealRoll = async (rollId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/${roomCode}/rolls/${rollId}/reveal`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ revealedBy: playerName }),
        }
      );

      if (response.ok) {
        fetchRolls();
      }
    } catch (err) {
      console.error('Error revealing roll:', err);
    }
  };

  const handleSetDC = async (dc: number | null) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rooms/${roomCode}/dc`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dc }),
        }
      );
      fetchRoomData();
    } catch (err) {
      console.error('Error setting DC:', err);
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDM = roomData?.mode === 'dm-led' && roomData?.dm === playerName;
  const isCreator = roomData?.creator === playerName;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Left: Room Code */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="font-mono text-sm px-3 py-1 border-purple-600/50 bg-purple-950/30 text-purple-300"
            >
              {roomCode}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyRoomLink}
              className="h-8 w-8 p-0"
            >
              <Copy className={`w-4 h-4 ${copied ? 'text-green-400' : 'text-slate-400'}`} />
            </Button>
          </div>

          {/* Center: DC Badge (DM-led only) */}
          {roomData?.mode === 'dm-led' && (
            <DCBadge 
              dc={roomData.dc} 
              onSetDC={isDM ? handleSetDC : undefined}
            />
          )}

          {/* Right: Status and Settings */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-500 hidden sm:inline">Reconnecting...</span>
                </>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(true)}
              className="h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Dice Roller */}
        <DiceRoller 
          onRoll={handleRoll}
          isDM={isDM}
          roomMode={roomData?.mode || 'open'}
        />

        {/* Roll History */}
        <RollHistory 
          rolls={rolls}
          currentPlayerName={playerName}
          isDM={isDM}
          onRevealRoll={handleRevealRoll}
          currentDC={roomData?.dc}
        />
      </div>

      {/* Player List Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className={`max-w-4xl mx-auto transition-transform duration-300 ${showPlayerList ? 'translate-y-0' : 'translate-y-full'}`}>
          <PlayerList
            players={players}
            roomData={roomData}
            currentPlayerName={playerName}
            isCreator={isCreator}
            onClose={() => setShowPlayerList(false)}
          />
        </div>
        
        {!showPlayerList && (
          <button
            onClick={() => setShowPlayerList(true)}
            className="w-full max-w-4xl mx-auto bg-slate-800 border-t border-slate-700 px-4 py-3 flex items-center justify-center gap-2 hover:bg-slate-750 transition-colors"
          >
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">
              {players.length} player{players.length !== 1 ? 's' : ''} online
            </span>
          </button>
        )}
      </div>

      {/* Room Settings Modal */}
      {showSettings && roomData && (
        <RoomSettings
          roomData={roomData}
          currentPlayerName={playerName}
          isCreator={isCreator}
          players={players}
          onClose={() => setShowSettings(false)}
          onLeaveRoom={onLeaveRoom}
          onRoomUpdated={fetchRoomData}
        />
      )}
    </div>
  );
}

function DCBadge({ dc, onSetDC }: { dc?: number; onSetDC?: (dc: number | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  const handleSave = () => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && onSetDC) {
      onSetDC(num);
      setEditing(false);
      setValue('');
    }
  };

  const handleClear = () => {
    if (onSetDC) {
      onSetDC(null);
    }
  };

  if (editing && onSetDC) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="DC"
          className="w-16 h-8 px-2 bg-slate-800 border border-slate-700 rounded text-sm text-center"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
        <Button size="sm" onClick={handleSave} className="h-8 text-xs">
          Set
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        className={`font-mono text-sm px-3 py-1 ${
          dc 
            ? 'bg-green-950/50 text-green-400 border-green-600/50' 
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}
        onClick={onSetDC ? () => setEditing(true) : undefined}
        style={{ cursor: onSetDC ? 'pointer' : 'default' }}
      >
        DC: {dc || '--'}
      </Badge>
      {dc && onSetDC && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClear}
          className="h-8 text-xs text-slate-400 hover:text-slate-200"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
