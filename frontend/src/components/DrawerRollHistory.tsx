/**
 * DrawerRollHistory Component - Roll history for mobile drawer
 *
 * Wrapper around VirtualRollHistory optimized for drawer context.
 * Only rendered on mobile (md:hidden) with touch-optimized scrolling.
 */

import VirtualRollHistory from './VirtualRollHistory';

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

interface DrawerRollHistoryProps {
  isOpen: boolean;
  rolls: DiceResult[];
}

export default function DrawerRollHistory({
  isOpen,
  rolls,
}: DrawerRollHistoryProps) {
  // Only render when drawer is open to save resources
  if (!isOpen) return null;

  // Calculate height: full viewport minus header (80px) and close button (70px)
  const drawerHeight =
    typeof window !== 'undefined'
      ? Math.max(300, window.innerHeight - 150)
      : 500;

  return (
    <div className="md:hidden h-full">
      <div className="px-4 pb-4">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Roll History
        </h2>
        <VirtualRollHistory
          rolls={rolls}
          height={drawerHeight}
          shouldAutoScroll={true}
        />
      </div>
    </div>
  );
}
