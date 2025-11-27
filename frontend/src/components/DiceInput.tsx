/**
 * DiceInput Component - Mobile Responsive
 *
 * Input component for simple 1d20 dice rolling with Figma design.
 * Mobile-first responsive design with 44px touch targets.
 * Includes toggle for Advanced mode with AdvancedDiceInput.
 */

import { useState, FormEvent } from 'react';
import { Dices, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import AdvancedDiceInput from './AdvancedDiceInput';

interface DiceInputProps {
  onRoll: (formula: string) => void;
  isRolling?: boolean;
}

export default function DiceInput({
  onRoll,
  isRolling = false,
}: DiceInputProps): JSX.Element {
  const [diceType, setDiceType] = useState<number>(20); // Default d20
  const [modifier, setModifier] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Standard D&D dice types
  const diceTypes = [4, 6, 8, 10, 12, 20, 100];

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Build formula: 1d{type} with optional modifier
    const formula = modifier === 0
      ? `1d${diceType}`
      : `1d${diceType}${modifier > 0 ? '+' : ''}${modifier}`;

    // Call parent callback with formula
    onRoll(formula);
  };

  // Formula preview for display
  const formulaPreview = modifier === 0
    ? `1d${diceType}`
    : `1d${diceType}${modifier > 0 ? '+' : ''}${modifier}`;

  return (
    <div className="space-y-4">
      {/* Toggle between Simple and Advanced */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2 h-11"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? 'Simple' : 'Advanced'}
        </Button>
      </div>

      {/* Simple Mode */}
      {!showAdvanced && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Formula Preview */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Dices className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xl md:text-2xl font-mono text-foreground">
                {formulaPreview}
              </div>
              <div className="text-sm text-muted-foreground">Standard roll</div>
            </div>
          </div>

          {/* Dice Type Selector - Mobile: Stacked, Desktop: Row */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Dice Type:</label>
            <div className="flex gap-2 flex-wrap">
              {diceTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={diceType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiceType(type)}
                  disabled={isRolling}
                  className="min-w-[44px] h-11 flex-1 sm:flex-none sm:w-14"
                >
                  d{type}
                </Button>
              ))}
            </div>
          </div>

          {/* Modifier Input - Mobile optimized */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Modifier:</label>
            <Input
              type="number"
              inputMode="numeric"
              value={modifier || ''}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              className="h-11 text-base md:text-sm text-center font-mono"
              placeholder="0"
              disabled={isRolling}
              aria-label="Dice modifier"
            />
          </div>

          {/* Roll Button - Full width, large touch target */}
          <Button
            type="submit"
            disabled={isRolling}
            className="w-full h-12 md:h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base md:text-lg"
            size="lg"
          >
            <Dices className="w-5 h-5 mr-2" />
            {isRolling ? 'Rolling...' : 'Roll'}
          </Button>
        </form>
      )}

      {/* Advanced Mode */}
      {showAdvanced && (
        <AdvancedDiceInput onRoll={onRoll} isLoading={isRolling} />
      )}
    </div>
  );
}
