/**
 * Header Component - Responsive header for Room view
 *
 * Displays room code, connection status, and navigation controls.
 * Adapts layout for mobile, tablet, and desktop viewports.
 */

import { Wifi, WifiOff, LogOut, Menu } from 'lucide-react';
import { Button } from './ui/button';
import RoomCodeDisplay from './RoomCodeDisplay';

interface HeaderProps {
  roomCode: string;
  isConnected: boolean;
  onLeaveRoom: () => void;
  onMenuToggle?: () => void; // Optional: for mobile hamburger menu
  showMenuButton?: boolean; // Show hamburger menu on mobile
}

export default function Header({
  roomCode,
  isConnected,
  onLeaveRoom,
  onMenuToggle,
  showMenuButton = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4 py-3">
        {/* Mobile: Hamburger Menu + Compact Room Code */}
        <div className="flex items-center gap-3 md:hidden">
          {showMenuButton && onMenuToggle && (
            <Button
              onClick={onMenuToggle}
              variant="ghost"
              size="sm"
              className="h-11 w-11 p-0"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <RoomCodeDisplay roomCode={roomCode} compact />
        </div>

        {/* Tablet/Desktop: Full Layout */}
        <div className="hidden md:flex items-center gap-2">
          <RoomCodeDisplay roomCode={roomCode} compact />
        </div>

        {/* Right: Connection Status + Leave Button (All sizes) */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi
              className="w-4 h-4 text-green-500"
              aria-label="Connected"
            />
          ) : (
            <WifiOff
              className="w-4 h-4 text-red-500"
              aria-label="Disconnected"
            />
          )}
          <Button
            onClick={onLeaveRoom}
            variant="ghost"
            size="sm"
            className="h-8"
            aria-label="Leave Room"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Leave</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
