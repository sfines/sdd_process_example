/**
 * DiceInput Component Tests
 *
 * Tests for the DiceInput component that handles dice roll input and submission.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiceInput from '../components/DiceInput';

describe('DiceInput', () => {
  it('renders the dice input form', () => {
    render(<DiceInput onRoll={vi.fn()} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /roll/i })).toBeInTheDocument();
  });

  it('accepts dice formula input', async () => {
    const user = userEvent.setup();
    render(<DiceInput onRoll={vi.fn()} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '1d20');

    expect(input).toHaveValue('1d20');
  });

  it('calls onRoll callback with formula when submitted', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /roll/i });

    await user.type(input, '1d20+5');
    await user.click(button);

    expect(mockOnRoll).toHaveBeenCalledWith('1d20+5');
  });

  it('calls onRoll when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '1d20+3{Enter}');

    expect(mockOnRoll).toHaveBeenCalledWith('1d20+3');
  });

  it('clears input after successful roll', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '1d20');
    await user.click(screen.getByRole('button', { name: /roll/i }));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('does not call onRoll with empty formula', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const button = screen.getByRole('button', { name: /roll/i });
    await user.click(button);

    expect(mockOnRoll).not.toHaveBeenCalled();
  });

  it('validates dice formula format', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'invalid');
    await user.click(screen.getByRole('button', { name: /roll/i }));

    // Should not call onRoll with invalid formula
    expect(mockOnRoll).not.toHaveBeenCalled();
  });

  it('accepts formula with positive modifier', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '1d20+7');
    await user.click(screen.getByRole('button', { name: /roll/i }));

    expect(mockOnRoll).toHaveBeenCalledWith('1d20+7');
  });

  it('accepts formula with negative modifier', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '1d20-2');
    await user.click(screen.getByRole('button', { name: /roll/i }));

    expect(mockOnRoll).toHaveBeenCalledWith('1d20-2');
  });

  it('disables button while rolling', async () => {
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} isRolling={true} />);

    const button = screen.getByRole('button', { name: /rolling/i });
    expect(button).toBeDisabled();
  });

  it('shows placeholder text in input', () => {
    render(<DiceInput onRoll={vi.fn()} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', expect.stringMatching(/1d20/i));
  });
});
