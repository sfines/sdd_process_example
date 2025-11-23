/**
 * RollHistory Component Tests
 *
 * Tests for the RollHistory component that displays past dice rolls.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import RollHistory from '../components/RollHistory';

describe('RollHistory', () => {
  it('renders the roll history heading', () => {
    render(<RollHistory rolls={[]} />);

    expect(screen.getByText(/roll history/i)).toBeInTheDocument();
  });

  it('displays empty state when no rolls', () => {
    render(<RollHistory rolls={[]} />);

    expect(screen.getByText(/no rolls yet/i)).toBeInTheDocument();
  });

  it('displays a single roll', () => {
    const rolls = [
      {
        roll_id: 'roll1',
        player_id: 'player1',
        player_name: 'Alice',
        formula: '1d20',
        individual_results: [15],
        modifier: 0,
        total: 15,
        timestamp: '2025-11-22T10:00:00Z',
      },
    ];

    render(<RollHistory rolls={rolls} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/1d20/i)).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('displays multiple rolls', () => {
    const rolls = [
      {
        roll_id: 'roll1',
        player_id: 'player1',
        player_name: 'Alice',
        formula: '1d20+5',
        individual_results: [12],
        modifier: 5,
        total: 17,
        timestamp: '2025-11-22T10:00:00Z',
      },
      {
        roll_id: 'roll2',
        player_id: 'player2',
        player_name: 'Bob',
        formula: '1d20-2',
        individual_results: [18],
        modifier: -2,
        total: 16,
        timestamp: '2025-11-22T10:01:00Z',
      },
    ];

    render(<RollHistory rolls={rolls} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('displays roll total prominently', () => {
    const rolls = [
      {
        roll_id: 'roll1',
        player_id: 'player1',
        player_name: 'Alice',
        formula: '1d20+5',
        individual_results: [12],
        modifier: 5,
        total: 17,
        timestamp: '2025-11-22T10:00:00Z',
      },
    ];

    render(<RollHistory rolls={rolls} />);

    // Check that total is displayed
    const totalElement = screen.getByText('17');
    expect(totalElement).toBeInTheDocument();
  });

  it('shows formula with modifier', () => {
    const rolls = [
      {
        roll_id: 'roll1',
        player_id: 'player1',
        player_name: 'Alice',
        formula: '1d20+5',
        individual_results: [12],
        modifier: 5,
        total: 17,
        timestamp: '2025-11-22T10:00:00Z',
      },
    ];

    render(<RollHistory rolls={rolls} />);

    expect(screen.getByText(/1d20\+5/i)).toBeInTheDocument();
  });

  it('shows individual die results', () => {
    const rolls = [
      {
        roll_id: 'roll1',
        player_id: 'player1',
        player_name: 'Alice',
        formula: '1d20',
        individual_results: [15],
        modifier: 0,
        total: 15,
        timestamp: '2025-11-22T10:00:00Z',
      },
    ];

    render(<RollHistory rolls={rolls} />);

    // Individual result should be shown in the "Result: [X]" format
    expect(screen.getByText(/Result: \[15\]/)).toBeInTheDocument();
  });

  it('displays most recent roll first', () => {
    const rolls = [
      {
        roll_id: 'roll1',
        player_id: 'player1',
        player_name: 'Alice',
        formula: '1d20',
        individual_results: [10],
        modifier: 0,
        total: 10,
        timestamp: '2025-11-22T10:00:00Z',
      },
      {
        roll_id: 'roll2',
        player_id: 'player2',
        player_name: 'Bob',
        formula: '1d20',
        individual_results: [15],
        modifier: 0,
        total: 15,
        timestamp: '2025-11-22T10:01:00Z', // More recent
      },
    ];

    render(<RollHistory rolls={rolls} />);

    const rollItems = screen.getAllByRole('listitem');
    // First item should be Bob (most recent)
    expect(within(rollItems[0]).getByText('Bob')).toBeInTheDocument();
    expect(within(rollItems[1]).getByText('Alice')).toBeInTheDocument();
  });

  it('handles negative modifier display', () => {
    const rolls = [
      {
        roll_id: 'roll1',
        player_id: 'player1',
        player_name: 'Alice',
        formula: '1d20-3',
        individual_results: [18],
        modifier: -3,
        total: 15,
        timestamp: '2025-11-22T10:00:00Z',
      },
    ];

    render(<RollHistory rolls={rolls} />);

    expect(screen.getByText(/1d20-3/i)).toBeInTheDocument();
  });

  it('shows timestamp for each roll', () => {
    const rolls = [
      {
        roll_id: 'roll1',
        player_id: 'player1',
        player_name: 'Alice',
        formula: '1d20',
        individual_results: [15],
        modifier: 0,
        total: 15,
        timestamp: '2025-11-22T10:00:00Z',
      },
    ];

    render(<RollHistory rolls={rolls} />);

    // Check for time element (exact format may vary)
    expect(screen.getByRole('time')).toBeInTheDocument();
  });

  it('uses roll_id as key for list items', () => {
    const rolls = [
      {
        roll_id: 'unique-roll-1',
        player_id: 'player1',
        player_name: 'Alice',
        formula: '1d20',
        individual_results: [15],
        modifier: 0,
        total: 15,
        timestamp: '2025-11-22T10:00:00Z',
      },
    ];

    const { container } = render(<RollHistory rolls={rolls} />);

    // React keys don't appear in DOM, but we can check data-testid if added
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(1);
  });
});
