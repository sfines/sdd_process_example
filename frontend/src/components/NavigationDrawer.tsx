/**
 * NavigationDrawer Component - Mobile slide-in navigation menu
 *
 * Appears on mobile devices (md:hidden) with smooth slide-in animation.
 * Contains room info, player details, roll history, and navigation actions.
 */

import { X } from 'lucide-react';
import { Button } from './ui/button';
import RoomCodeDisplay from './RoomCodeDisplay';
import DrawerRollHistory from './DrawerRollHistory';
import { useEffect } from 'react';

interface DiceResult {
  roll_id: string;
  player_id: string;
  player_name: string;
  formula: string;
  individual_results: number[];
  modifier: number;
  total: number;
  timestamp: string;
}

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  playerName: string;
  onLeaveRoom: () => void;
  rollHistory?: DiceResult[];
}

export default function NavigationDrawer({
  isOpen,
  onClose,
  roomCode,
  playerName,
  onLeaveRoom,
  rollHistory = [],
}: NavigationDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[1000] md:hidden"
        onClick={onClose}
        aria-label="Close menu"
      />

      {/* Drawer - Slides in from left */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-[1001]
          w-[80vw] max-w-[300px]
          bg-slate-900 border-r border-slate-800
          shadow-2xl
          transform transition-transform duration-200 ease-in-out
          md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer Content */}
        <div className="flex flex-col h-full">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-slate-100">Menu</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Room Info Section - Fixed at top */}
            <div className="p-4 space-y-6 border-b border-slate-800">
              {/* Room Code Section */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">
                  Room Code
                </h3>
                <RoomCodeDisplay roomCode={roomCode} compact={false} />
              </div>

              {/* Player Info Section */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">
                  Player
                </h3>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-100 font-medium">{playerName}</p>
                </div>
              </div>
            </div>

            {/* Roll History Section - Scrollable */}
            <DrawerRollHistory isOpen={isOpen} rolls={rollHistory} />
          </div>

          {/* Footer with Leave Button */}
          <div className="p-4 border-t border-slate-800">
            <Button
              onClick={() => {
                onLeaveRoom();
                onClose();
              }}
              variant="destructive"
              className="w-full"
            >
              Leave Room
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
