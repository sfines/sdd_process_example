/**
 * Unit tests for AdvancedDiceInput component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdvancedDiceInput from '../AdvancedDiceInput';

describe('AdvancedDiceInput', () => {
  describe('Formula Generation', () => {
    it('generates correct formula for d20', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('1d20');
    });

    it('generates correct formula for d4', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} defaultDiceSize={4} />);

      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('1d4');
    });

    it('generates correct formula for d6', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      fireEvent.click(screen.getByText('d6'));
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('1d6');
    });

    it('generates correct formula for d8', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      fireEvent.click(screen.getByText('d8'));
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('1d8');
    });

    it('generates correct formula for d10', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      fireEvent.click(screen.getByText('d10'));
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('1d10');
    });

    it('generates correct formula for d12', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      fireEvent.click(screen.getByText('d12'));
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('1d12');
    });

    it('generates correct formula for d100', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      fireEvent.click(screen.getByText('d100'));
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('1d100');
    });

    it('generates correct formula for multiple dice', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      const quantityInput = screen.getByLabelText(/number of dice/i);
      fireEvent.change(quantityInput, { target: { value: '3' } });
      fireEvent.click(screen.getByText('d6'));
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('3d6');
    });

    it('generates correct formula with positive modifier', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      const modifierInput = screen.getByLabelText(/dice modifier/i);
      fireEvent.change(modifierInput, { target: { value: '5' } });
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('1d20+5');
    });

    it('generates correct formula with negative modifier', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      const modifierInput = screen.getByLabelText(/dice modifier/i);
      fireEvent.change(modifierInput, { target: { value: '-3' } });
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('1d20-3');
    });

    it('generates complex formula: 3d6+2', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      const quantityInput = screen.getByLabelText(/number of dice/i);
      fireEvent.change(quantityInput, { target: { value: '3' } });
      fireEvent.click(screen.getByText('d6'));
      const modifierInput = screen.getByLabelText(/dice modifier/i);
      fireEvent.change(modifierInput, { target: { value: '2' } });
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('3d6+2');
    });

    it('generates large quantity formula: 20d6', () => {
      const onRoll = vi.fn();
      render(<AdvancedDiceInput onRoll={onRoll} />);

      const quantityInput = screen.getByLabelText(/number of dice/i);
      fireEvent.change(quantityInput, { target: { value: '20' } });
      fireEvent.click(screen.getByText('d6'));
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));

      expect(onRoll).toHaveBeenCalledWith('20d6');
    });
  });

  describe('Quantity Validation', () => {
    it('validates quantity is at least 1', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const quantityInput = screen.getByLabelText(/number of dice/i);
      fireEvent.change(quantityInput, { target: { value: '0' } });

      expect(screen.getByText(/quantity must be between 1 and 100/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /roll/i })).toBeDisabled();
    });

    it('validates quantity is at most 100', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const quantityInput = screen.getByLabelText(/number of dice/i);
      fireEvent.change(quantityInput, { target: { value: '101' } });

      expect(screen.getByText(/quantity must be between 1 and 100/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /roll/i })).toBeDisabled();
    });

    it('accepts valid quantity of 1', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const quantityInput = screen.getByLabelText(/number of dice/i);
      fireEvent.change(quantityInput, { target: { value: '1' } });

      expect(screen.queryByText(/quantity must be between/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /roll/i })).not.toBeDisabled();
    });

    it('accepts valid quantity of 100', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const quantityInput = screen.getByLabelText(/number of dice/i);
      fireEvent.change(quantityInput, { target: { value: '100' } });

      expect(screen.queryByText(/quantity must be between/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /roll/i })).not.toBeDisabled();
    });
  });

  describe('Modifier Validation', () => {
    it('disables button when modifier is below -99', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const modifierInput = screen.getByLabelText(/dice modifier/i);
      fireEvent.change(modifierInput, { target: { value: '-100' } });

      // Button should be disabled for invalid input
      expect(screen.getByRole('button', { name: /roll/i })).toBeDisabled();
    });

    it('disables button when modifier is above 99', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const modifierInput = screen.getByLabelText(/dice modifier/i);
      fireEvent.change(modifierInput, { target: { value: '100' } });

      // Button should be disabled for invalid input
      expect(screen.getByRole('button', { name: /roll/i })).toBeDisabled();
    });

    it('accepts valid modifier of -99', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const modifierInput = screen.getByLabelText(/dice modifier/i);
      fireEvent.change(modifierInput, { target: { value: '-99' } });

      expect(screen.queryByText(/modifier must be between/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /roll/i })).not.toBeDisabled();
    });

    it('accepts valid modifier of 99', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const modifierInput = screen.getByLabelText(/dice modifier/i);
      fireEvent.change(modifierInput, { target: { value: '99' } });

      expect(screen.queryByText(/modifier must be between/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /roll/i })).not.toBeDisabled();
    });

    it('increments modifier with + button', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} defaultModifier={5} />);

      const incrementButton = screen.getByLabelText(/increase modifier/i);
      fireEvent.click(incrementButton);

      expect(screen.getByText('1d20+6')).toBeInTheDocument();
    });

    it('decrements modifier with - button', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} defaultModifier={5} />);

      const decrementButton = screen.getByLabelText(/decrease modifier/i);
      fireEvent.click(decrementButton);

      expect(screen.getByText('1d20+4')).toBeInTheDocument();
    });

    it('disables increment button at max modifier (99)', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} defaultModifier={99} />);

      const incrementButton = screen.getByLabelText(/increase modifier/i);
      expect(incrementButton).toBeDisabled();
    });

    it('disables decrement button at min modifier (-99)', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} defaultModifier={-99} />);

      const decrementButton = screen.getByLabelText(/decrease modifier/i);
      expect(decrementButton).toBeDisabled();
    });
  });

  describe('Formula Preview', () => {
    it('updates preview in real-time when changing dice type', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      expect(screen.getByText('1d20')).toBeInTheDocument();

      fireEvent.click(screen.getByText('d6'));
      expect(screen.getByText('1d6')).toBeInTheDocument();
    });

    it('updates preview in real-time when changing quantity', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const quantityInput = screen.getByLabelText(/number of dice/i);
      fireEvent.change(quantityInput, { target: { value: '5' } });

      expect(screen.getByText('5d20')).toBeInTheDocument();
    });

    it('updates preview in real-time when changing modifier', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const modifierInput = screen.getByLabelText(/dice modifier/i);
      fireEvent.change(modifierInput, { target: { value: '7' } });

      expect(screen.getByText('1d20+7')).toBeInTheDocument();
    });

    it('updates preview for complex formula changes', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const quantityInput = screen.getByLabelText(/number of dice/i);
      fireEvent.change(quantityInput, { target: { value: '8' } });
      fireEvent.click(screen.getByText('d10'));
      const modifierInput = screen.getByLabelText(/dice modifier/i);
      fireEvent.change(modifierInput, { target: { value: '-2' } });

      expect(screen.getByText('8d10-2')).toBeInTheDocument();
    });
  });

  describe('Dice Type Selection', () => {
    it('only allows valid dice types', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} />);

      const validTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
      validTypes.forEach((type) => {
        expect(screen.getByText(type)).toBeInTheDocument();
      });
    });

    it('highlights selected dice type', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} defaultDiceSize={6} />);

      const d6Button = screen.getByText('d6');
      // Check that d6 button has default variant classes (bg-primary)
      expect(d6Button.closest('button')?.className).toContain('bg-primary');
    });
  });

  describe('Loading State', () => {
    it('disables all controls when loading', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} isLoading={true} />);

      expect(screen.getByRole('button', { name: /roll/i })).toBeDisabled();
      expect(screen.getByLabelText(/number of dice/i)).toBeDisabled();
      expect(screen.getByLabelText(/dice modifier/i)).toBeDisabled();
    });

    it('shows "Rolling..." text when loading', () => {
      render(<AdvancedDiceInput onRoll={vi.fn()} isLoading={true} />);

      expect(screen.getByText('Rolling...')).toBeInTheDocument();
    });
  });
});
