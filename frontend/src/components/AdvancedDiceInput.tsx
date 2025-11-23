/**
 * AdvancedDiceInput Component
 *
 * Advanced dice rolling controls supporting all standard D&D dice types,
 * quantities (1-100), and modifiers (-99 to +99).
 */

import { useState, FormEvent } from 'react';
import { Dices } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
type DiceType = typeof DICE_TYPES[number];

interface AdvancedDiceInputProps {
  onRoll: (formula: string) => void;
  isLoading?: boolean;
  defaultDiceSize?: DiceType;
  defaultQuantity?: number;
  defaultModifier?: number;
}

export default function AdvancedDiceInput({
  onRoll,
  isLoading = false,
  defaultDiceSize = 20,
  defaultQuantity = 1,
  defaultModifier = 0,
}: AdvancedDiceInputProps): JSX.Element {
  const [numDice, setNumDice] = useState<number>(defaultQuantity);
  const [diceSize, setDiceSize] = useState<DiceType>(defaultDiceSize);
  const [modifier, setModifier] = useState<number>(defaultModifier);

  // Validate only if value is a number (not NaN)
  const isValidQuantity = numDice >= 1 && numDice <= 100;
  const isValidModifier = modifier >= -99 && modifier <= 99;
  const isFormValid = isValidQuantity && isValidModifier;

  const buildFormula = (): string => {
    const base = `${numDice}d${diceSize}`;
    if (modifier === 0) return base;
    return `${base}${modifier > 0 ? '+' : ''}${modifier}`;
  };

  const formulaPreview = buildFormula();

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    onRoll(formulaPreview);
  };

  const handleModifierIncrement = (): void => {
    setModifier((prev) => Math.min(99, prev + 1));
  };

  const handleModifierDecrement = (): void => {
    setModifier((prev) => Math.max(-99, prev - 1));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dice Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Dice Type
        </label>
        <div className="grid grid-cols-7 gap-2">
          {DICE_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant={diceSize === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDiceSize(type)}
              disabled={isLoading}
              className="font-mono"
            >
              d{type}
            </Button>
          ))}
        </div>
      </div>

      {/* Quantity Input */}
      <div className="space-y-2">
        <label htmlFor="quantity" className="text-sm font-medium text-muted-foreground">
          Quantity (1-100)
        </label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={100}
          value={isNaN(numDice) ? '' : numDice}
          onChange={(e) => {
            const value = e.target.value === '' ? 1 : parseInt(e.target.value);
            setNumDice(value);
          }}
          disabled={isLoading}
          className="font-mono"
          aria-label="Number of dice"
        />
        {!isValidQuantity && (
          <p className="text-sm text-destructive">
            Quantity must be between 1 and 100
          </p>
        )}
      </div>

      {/* Modifier Input */}
      <div className="space-y-2">
        <label htmlFor="modifier" className="text-sm font-medium text-muted-foreground">
          Modifier (-99 to +99)
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleModifierDecrement}
            disabled={isLoading || modifier <= -99}
            aria-label="Decrease modifier"
          >
            -
          </Button>
          <Input
            id="modifier"
            type="number"
            min={-99}
            max={99}
            value={isNaN(modifier) ? '' : modifier}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseInt(e.target.value);
              setModifier(value);
            }}
            disabled={isLoading}
            className="text-center font-mono flex-1"
            aria-label="Dice modifier"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleModifierIncrement}
            disabled={isLoading || modifier >= 99}
            aria-label="Increase modifier"
          >
            +
          </Button>
        </div>
        {!isValidModifier && (
          <p className="text-sm text-destructive">
            Modifier must be between -99 and +99
          </p>
        )}
      </div>

      {/* Formula Preview */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground mb-1">Formula:</div>
        <div className="text-3xl font-mono font-bold text-foreground">
          {formulaPreview}
        </div>
      </div>

      {/* Roll Button */}
      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full h-12"
        size="lg"
      >
        <Dices className="w-5 h-5 mr-2" />
        {isLoading ? 'Rolling...' : 'Roll'}
      </Button>
    </form>
  );
}
