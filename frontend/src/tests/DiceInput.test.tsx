/**
 * DiceInput Component Tests
 *
 * Tests for the DiceInput component with Figma design (simple 1d20 mode).
 * Migrated to test shadcn/ui components and modifier-based input.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiceInput from '../components/DiceInput';

describe('DiceInput - Figma Design', () => {
  it('renders the dice input form with Figma styling', () => {
    render(<DiceInput onRoll={vi.fn()} />);

    expect(screen.getByLabelText(/modifier/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /roll/i })).toBeInTheDocument();
  });

  it('displays 1d20 formula preview', () => {
    render(<DiceInput onRoll={vi.fn()} />);

    expect(screen.getByText('1d20')).toBeInTheDocument();
    expect(screen.getByText('Standard roll')).toBeInTheDocument();
  });

  it('accepts modifier input', async () => {
    const user = userEvent.setup();
    render(<DiceInput onRoll={vi.fn()} />);

    const input = screen.getByLabelText(/modifier/i);
    await user.clear(input);
    await user.type(input, '5');

    expect(input).toHaveValue(5);
  });

  it('calls onRoll with 1d20 formula when no modifier', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const button = screen.getByRole('button', { name: /roll/i });
    await user.click(button);

    expect(mockOnRoll).toHaveBeenCalledWith('1d20');
  });

  it('calls onRoll with formula including positive modifier', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const input = screen.getByLabelText(/modifier/i);
    const button = screen.getByRole('button', { name: /roll/i });

    await user.clear(input);
    await user.type(input, '7');
    await user.click(button);

    expect(mockOnRoll).toHaveBeenCalledWith('1d20+7');
  });

  it('calls onRoll with formula including negative modifier', async () => {
    const user = userEvent.setup();
    const mockOnRoll = vi.fn();
    render(<DiceInput onRoll={mockOnRoll} />);

    const input = screen.getByLabelText(/modifier/i);
    const button = screen.getByRole('button', { name: /roll/i });

    await user.clear(input);
    await user.type(input, '-2');
    await user.click(button);

    expect(mockOnRoll).toHaveBeenCalledWith('1d20-2');
  });

  it('updates formula preview when modifier changes', async () => {
    const user = userEvent.setup();
    render(<DiceInput onRoll={vi.fn()} />);

    const input = screen.getByLabelText(/modifier/i);

    await user.clear(input);
    await user.type(input, '5');

    expect(screen.getByText('1d20+5')).toBeInTheDocument();
  });

  it('disables input and button while rolling', () => {
    render(<DiceInput onRoll={vi.fn()} isRolling={true} />);

    const button = screen.getByRole('button', { name: /rolling/i });
    const input = screen.getByLabelText(/modifier/i);

    expect(button).toBeDisabled();
    expect(input).toBeDisabled();
  });

  it('displays Dices icon from Lucide React', () => {
    const { container } = render(<DiceInput onRoll={vi.fn()} />);

    // Check for SVG icon (Lucide icons render as SVG)
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  it('shows placeholder in modifier input', () => {
    render(<DiceInput onRoll={vi.fn()} />);

    const input = screen.getByLabelText(/modifier/i);
    expect(input).toHaveAttribute('placeholder', '0');
  });
});
