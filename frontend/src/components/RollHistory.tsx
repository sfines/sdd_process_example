/**
 * RollHistory Component
 *
 * Displays the history of dice rolls in the room with Figma design.
 * Card-based layout with ScrollArea for smooth scrolling.
 * Supports expandable display for large multi-dice rolls (>10 dice).
 */

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
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

interface RollHistoryProps {
  rolls: DiceResult[];
}

export default function RollHistory({ rolls }: RollHistoryProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedRolls, setExpandedRolls] = useState<Set<string>>(new Set());

  // Auto-scroll to top when new roll is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
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

  // Sort rolls by timestamp descending (most recent first)
  const sortedRolls = [...rolls].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <ScrollArea className="h-96">
      <div ref={scrollRef} className="space-y-3 p-4">
        {sortedRolls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🎲</div>
            <p>No rolls yet</p>
            <p className="text-sm mt-1">Roll the dice to get started!</p>
          </div>
        ) : (
          sortedRolls.map((roll, index) => (
            <div key={roll.roll_id}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Player name with badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="font-medium">
                          {roll.player_name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          rolled
                        </span>
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
              {index < sortedRolls.length - 1 && <Separator className="my-2" />}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
