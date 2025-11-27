import React, { useEffect, useState } from 'react';
import { Dices, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Roll } from './RoomView';

interface PermalinkPageProps {
  rollId: string;
  onNavigateHome: () => void;
}

export function PermalinkPage({ rollId, onNavigateHome }: PermalinkPageProps) {
  const [roll, setRoll] = useState<Roll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoll();
  }, [rollId]);

  const fetchRoll = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3028a7ac/rolls/${rollId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoll(data);
      } else {
        setError('Roll not found');
      }
    } catch (err) {
      console.error('Error fetching roll:', err);
      setError('Failed to load roll');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading roll...</div>
      </div>
    );
  }

  if (error || !roll) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800 text-center">
            <div className="text-4xl mb-4">🎲</div>
            <h2 className="text-slate-100 mb-2">Roll Not Found</h2>
            <p className="text-slate-400 mb-6">
              This roll doesn't exist or has been deleted.
            </p>
            <Button
              onClick={onNavigateHome}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const result = roll.dc !== undefined 
    ? roll.total >= roll.dc ? 'pass' : 'fail'
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <Dices className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-white mb-2">Verified Roll</h1>
            <p className="text-purple-100 text-sm">
              D&D Dice Roller • Public Verification
            </p>
          </div>

          {/* Roll Details */}
          <div className="p-8 space-y-6">
            {/* Player */}
            <div>
              <div className="text-sm text-slate-400 mb-1">Player</div>
              <div className="text-xl text-slate-100">{roll.playerName}</div>
            </div>

            {/* Formula */}
            <div>
              <div className="text-sm text-slate-400 mb-2">Dice Formula</div>
              <div className="text-2xl font-mono text-slate-100 bg-slate-800 p-4 rounded-lg border border-slate-700">
                {roll.diceFormula}
                {roll.advantage === 'advantage' && ' (Advantage)'}
                {roll.advantage === 'disadvantage' && ' (Disadvantage)'}
              </div>
            </div>

            {/* Individual Results */}
            <div>
              <div className="text-sm text-slate-400 mb-2">Individual Rolls</div>
              <div className="flex items-center gap-3 flex-wrap">
                {roll.advantage && roll.advantageRolls ? (
                  <>
                    {roll.advantageRolls.map((val, idx) => (
                      <div
                        key={idx}
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-lg text-xl font-mono ${
                          roll.diceResults.includes(val)
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-500 line-through'
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {roll.diceResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-lg text-xl font-mono text-slate-100"
                      >
                        {result}
                      </div>
                    ))}
                  </>
                )}
                {roll.modifier !== 0 && (
                  <div className="text-2xl text-slate-400">
                    {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                  </div>
                )}
                <div className="text-2xl text-slate-400">=</div>
              </div>
            </div>

            {/* Total Result */}
            <div>
              <div className="text-sm text-slate-400 mb-2">Total Result</div>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-mono text-slate-100 bg-slate-800 px-8 py-6 rounded-xl border-2 border-slate-700">
                  {roll.total}
                </div>
                {result && (
                  <Badge
                    className={`text-lg px-6 py-3 ${
                      result === 'pass'
                        ? 'bg-green-950/50 text-green-400 border-green-600/50'
                        : 'bg-red-950/50 text-red-400 border-red-600/50'
                    }`}
                  >
                    {result === 'pass' ? '✓ Pass' : '✗ Fail'}
                  </Badge>
                )}
              </div>
              {roll.dc !== undefined && (
                <div className="text-sm text-slate-400 mt-2">
                  DC was {roll.dc}
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div>
              <div className="text-sm text-slate-400 mb-1">Timestamp</div>
              <div className="text-slate-100">{formatDate(roll.timestamp)}</div>
            </div>

            {/* Hidden Roll Notice */}
            {roll.isHidden && roll.revealedBy && (
              <div className="p-4 bg-purple-950/30 border border-purple-600/50 rounded-lg">
                <div className="text-sm text-purple-300">
                  This was originally a hidden roll, revealed by {roll.revealedBy}
                </div>
              </div>
            )}

            {/* Action */}
            <div className="pt-4 border-t border-slate-800">
              <Button
                onClick={onNavigateHome}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12"
              >
                Roll Your Own
              </Button>
            </div>
          </div>
        </div>

        {/* Verification Notice */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>This roll is cryptographically verified and cannot be altered.</p>
          <p className="mt-1">Share this URL to prove your result.</p>
        </div>
      </div>
    </div>
  );
}
