/**
 * DiceInput Component
 *
 * Input component for entering and rolling dice formulas (e.g., 1d20+5).
 */

import { useState, FormEvent, KeyboardEvent } from 'react';

interface DiceInputProps {
  onRoll: (formula: string) => void;
  isRolling?: boolean;
}

export default function DiceInput({
  onRoll,
  isRolling = false,
}: DiceInputProps): JSX.Element {
  const [formula, setFormula] = useState('');

  // Validate dice formula format (e.g., 1d20, 1d20+5, 1d20-2)
  const isValidFormula = (value: string): boolean => {
    const dicePattern = /^(\d+)d(\d+)([+-]\d+)?$/i;
    return dicePattern.test(value.trim());
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const trimmedFormula = formula.trim();

    // Don't submit empty or invalid formulas
    if (!trimmedFormula || !isValidFormula(trimmedFormula)) {
      return;
    }

    // Call parent callback with formula
    onRoll(trimmedFormula);

    // Clear input after successful submission
    setFormula('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedFormula = formula.trim();

      if (trimmedFormula && isValidFormula(trimmedFormula)) {
        onRoll(trimmedFormula);
        setFormula('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="1d20+5"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isRolling}
        aria-label="Dice formula"
      />

      <button
        type="submit"
        disabled={isRolling || !formula.trim() || !isValidFormula(formula)}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {isRolling ? 'Rolling...' : 'Roll'}
      </button>
    </form>
  );
}
