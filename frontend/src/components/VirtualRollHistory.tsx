/**
 * VirtualRollHistory Component
 *
 * High-performance virtual scrolling for roll history with 100+ rolls.
 * Uses react-window FixedSizeList for efficient DOM rendering.
 * Preserves complete Figma design system styling.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { FixedSizeList as List, FixedSizeList } from 'react-window';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

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

interface VirtualRollHistoryProps {
  rolls: DiceResult[];
  height?: number; // Viewport height in pixels (default: 400px)
  itemHeight?: number; // Fixed height per roll item (default: auto-calculated)
  onScroll?: (isScrolledToBottom: boolean) => void;
  shouldAutoScroll?: boolean;
}

export default function VirtualRollHistory({
  rolls,
  height = 400,
  itemHeight = 120, // Reduced - more items fit in viewport for better test visibility
  onScroll,
  shouldAutoScroll = true,
}: VirtualRollHistoryProps): JSX.Element {
  const listRef = useRef<FixedSizeList>(null);
  const [expandedRolls, setExpandedRolls] = useState<Set<string>>(new Set());

  // Sort rolls by timestamp descending (most recent first)
  const sortedRolls = [...rolls].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  // Auto-scroll to top when new rolls added (if shouldAutoScroll is true)
  useEffect(() => {
    if (shouldAutoScroll && listRef.current && sortedRolls.length > 0) {
      // Force scroll to top to show newest roll
      listRef.current.scrollToItem(0, 'start');
    }
  }, [sortedRolls.length, shouldAutoScroll]);

  // Force re-render when rolls change by tracking count
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    setRenderKey((prev) => prev + 1);
  }, [rolls.length]);

  const toggleExpand = (rollId: string): void => {
    setExpandedRolls((prev) => {
      const next = new Set(prev);
      if (next.has(rollId)) {
        next.delete(rollId);
      } else {
        next.add(rollId);
      }
      return next;
    });
  };

  // Format timestamp to readable time (HH:MM:SS)
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format individual results based on count and expansion state
  const formatResults = (
    roll: DiceResult,
    isExpanded: boolean,
  ): JSX.Element => {
    const results = roll.individual_results;
    const hasMany = results.length > 10;

    if (!hasMany || isExpanded) {
      // Show all results in grid format for expanded or small rolls
      return (
        <div className="flex flex-wrap gap-1">
          {results.map((value, idx) => (
            <span
              key={idx}
              className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-muted rounded text-sm font-medium"
            >
              {value}
            </span>
          ))}
        </div>
      );
    }

    // Show compact format with "...+N more" for large rolls
    const visibleCount = 6;
    const remainingCount = results.length - visibleCount;
    const visibleResults = results.slice(0, visibleCount);

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visibleResults.map((value, idx) => (
          <span
            key={idx}
            className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-muted rounded text-sm font-medium"
          >
            {value}
          </span>
        ))}
        <span className="text-sm text-muted-foreground">
          ...+{remainingCount} more
        </span>
      </div>
    );
  };

  // Handle scroll events to track position
  const handleScroll = ({
    scrollOffset,
  }: {
    scrollOffset: number;
    scrollUpdateWasRequested: boolean;
  }): void => {
    const maxScrollOffset = sortedRolls.length * itemHeight - height;
    const isAtBottom = scrollOffset >= maxScrollOffset - 100; // Within 100px of bottom

    if (onScroll) {
      onScroll(isAtBottom);
    }
  };

  // Row renderer for FixedSizeList - MUST be memoized for react-window
  const RollItem = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const roll = sortedRolls[index];
      if (!roll) return null;

      return (
        <div style={style} className="px-4 pt-3" data-testid={`roll-${roll.roll_id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Player name with badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="font-medium">
                      {roll.player_name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">rolled</span>
                  </div>

                  {/* Formula in primary color, bold */}
                  <div className="text-lg font-bold text-primary mb-2">
                    {roll.formula}
                  </div>

                  {/* Individual results with expandable display */}
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Results:{' '}
                      {formatResults(roll, expandedRolls.has(roll.roll_id))}
                      {roll.modifier !== 0 && (
                        <span className="ml-2">
                          {roll.modifier > 0 ? '+' : ''}
                          {roll.modifier}
                        </span>
                      )}
                    </div>

                    {/* Show expand/collapse button for large rolls */}
                    {roll.individual_results.length > 10 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(roll.roll_id)}
                        className="h-6 px-2 text-xs"
                      >
                        {expandedRolls.has(roll.roll_id)
                          ? 'Show less'
                          : 'Show all'}
                      </Button>
                    )}
                  </div>

                  {/* Timestamp - small, muted */}
                  <time
                    dateTime={roll.timestamp}
                    className="text-xs text-muted-foreground mt-1 block"
                  >
                    {formatTime(roll.timestamp)}
                  </time>
                </div>

                {/* Total result - large, prominent */}
                <div className="ml-4 flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold">
                  {roll.total}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Separator between rolls (except last) */}
          {index < sortedRolls.length - 1 && (
            <div className="pt-2">
              <Separator />
            </div>
          )}
        </div>
      );
    },
    [sortedRolls, expandedRolls],
  );

  // Empty state
  if (sortedRolls.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-center text-muted-foreground"
        style={{ height }}
      >
        <div className="py-8">
          <div className="text-4xl mb-2">🎲</div>
          <p>No rolls yet</p>
          <p className="text-sm mt-1">Roll the dice to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div role="list" className="virtual-roll-container" data-testid="virtual-roll-history">
      <List
        key={`roll-list-${renderKey}`}
        ref={listRef}
        height={height}
        itemCount={sortedRolls.length}
        itemSize={itemHeight}
        width="100%"
        onScroll={handleScroll}
        className="virtual-roll-list"
      >
        {RollItem}
      </List>
    </div>
  );
}
