/**
 * RollHistory Component
 *
 * Displays the history of dice rolls in the room with Figma design.
 * Card-based layout with ScrollArea for smooth scrolling.
 */

import { useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

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

export default function RollHistory({
  rolls,
}: RollHistoryProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new roll is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [rolls.length]);

  // Format timestamp to readable time (HH:MM:SS)
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Sort rolls by timestamp descending (most recent first)
  const sortedRolls = [...rolls].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
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

                      {/* Individual results with muted color */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          Results: [{roll.individual_results.join(', ')}]
                          {roll.modifier !== 0 && (
                            <span>
                              {' '}
                              {roll.modifier > 0 ? '+' : ''}
                              {roll.modifier}
                            </span>
                          )}
                        </span>
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
