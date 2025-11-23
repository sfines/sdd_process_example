import React, { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Eye, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Roll } from './RoomView';

interface RollHistoryProps {
  rolls: Roll[];
  currentPlayerName: string;
  isDM: boolean;
  onRevealRoll: (rollId: string) => void;
  currentDC?: number;
}

export function RollHistory({ rolls, currentPlayerName, isDM, onRevealRoll, currentDC }: RollHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to top when new roll is added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [rolls.length]);

  const formatTimestamp = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return `${Math.floor(hours / 24)}d ago`;
  };

  const copyPermalink = (rollId: string) => {
    const link = `${window.location.origin}/roll/${rollId}`;
    navigator.clipboard.writeText(link);
  };

  const getRollResult = (roll: Roll): 'pass' | 'fail' | null => {
    if (currentDC === undefined) return null;
    return roll.total >= currentDC ? 'pass' : 'fail';
  };

  if (rolls.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
        <div className="text-slate-500">
          <div className="text-4xl mb-4">🎲</div>
          <p>No rolls yet</p>
          <p className="text-sm mt-2">Roll the dice to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-slate-100">Roll History</h2>
        <p className="text-sm text-slate-400">{rolls.length} roll{rolls.length !== 1 ? 's' : ''}</p>
      </div>
      
      <div 
        ref={scrollRef}
        className="max-h-96 overflow-y-auto divide-y divide-slate-800"
      >
        {rolls.map((roll) => {
          const isHidden = roll.isHidden && !roll.revealedBy;
          const canSeeRoll = !isHidden || isDM;
          const result = getRollResult(roll);

          return (
            <div key={roll.id} className="p-4 hover:bg-slate-850 transition-colors">
              {/* Player and Timestamp */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-100">{roll.playerName}</span>
                  {roll.playerName === currentPlayerName && (
                    <Badge variant="outline" className="text-xs border-purple-600/50 bg-purple-950/30 text-purple-300">
                      You
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {formatTimestamp(roll.timestamp)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyPermalink(roll.id)}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {isHidden && !isDM ? (
                // Hidden roll for non-DM players
                <div className="text-sm text-slate-500 italic">
                  DM rolled hidden {roll.diceFormula.match(/d\d+/)?.[0] || 'dice'}
                </div>
              ) : (
                <>
                  {/* Formula */}
                  <div className="text-sm font-mono text-slate-400 mb-2">
                    {roll.diceFormula}
                    {roll.advantage === 'advantage' && ' (Advantage)'}
                    {roll.advantage === 'disadvantage' && ' (Disadvantage)'}
                  </div>

                  {/* Dice Results */}
                  <div className="flex items-center gap-3 mb-2">
                    {roll.advantage && roll.advantageRolls ? (
                      // Advantage/Disadvantage rolls
                      <div className="flex items-center gap-2 text-sm">
                        {roll.advantageRolls.map((val, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded font-mono ${
                              roll.diceResults.includes(val)
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-500 line-through'
                            }`}
                          >
                            {val}
                          </span>
                        ))}
                        {roll.modifier !== 0 && (
                          <span className="text-slate-400">
                            {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                          </span>
                        )}
                      </div>
                    ) : (
                      // Normal rolls
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        {roll.diceResults.map((result, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 bg-slate-800 rounded font-mono text-slate-200"
                          >
                            {result}
                          </span>
                        ))}
                        {roll.modifier !== 0 && (
                          <span className="text-slate-400">
                            {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Total */}
                    <div className="ml-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-mono text-slate-100">
                          {roll.total}
                        </span>
                        {result && (
                          <div className="flex items-center gap-1">
                            {result === 'pass' ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-green-500">Pass</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-red-500">Fail</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hidden Roll Controls */}
                  {isHidden && isDM && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-amber-400">
                          <Eye className="w-4 h-4" />
                          <span>Hidden from players</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onRevealRoll(roll.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white h-8"
                        >
                          Reveal
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Revealed Marker */}
                  {roll.isHidden && roll.revealedBy && (
                    <div className="mt-2 text-xs text-slate-500 italic">
                      Revealed by {roll.revealedBy}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
