/**
 * DiceInput Component
 *
 * Input component for simple 1d20 dice rolling with Figma design.
 * Migrated from basic Tailwind to shadcn/ui design system.
 */

import { useState, FormEvent } from 'react';
import { Dices } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface DiceInputProps {
  onRoll: (formula: string) => void;
  isRolling?: boolean;
}

export default function DiceInput({
  onRoll,
  isRolling = false,
}: DiceInputProps): JSX.Element {
  const [modifier, setModifier] = useState<number>(0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Build formula: 1d20 with optional modifier
    const formula = modifier === 0
      ? '1d20'
      : `1d20${modifier > 0 ? '+' : ''}${modifier}`;

    // Call parent callback with formula
    onRoll(formula);
  };

  // Formula preview for display
  const formulaPreview = modifier === 0
    ? '1d20'
    : `1d20${modifier > 0 ? '+' : ''}${modifier}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Dices className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-mono text-foreground">
                {formulaPreview}
              </div>
              <div className="text-sm text-muted-foreground">Standard roll</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Modifier:</label>
          <Input
            type="number"
            value={modifier || ''}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
            className="w-20 h-10 text-center font-mono"
            placeholder="0"
            disabled={isRolling}
            aria-label="Dice modifier"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isRolling}
        className="w-full h-12"
        size="lg"
      >
        <Dices className="w-5 h-5 mr-2" />
        {isRolling ? 'Rolling...' : 'Roll'}
      </Button>
    </form>
  );
}
