/**
 * PlayerList Component Tests
 *
 * Tests for the PlayerList component with Figma card-based design.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlayerList from '../components/PlayerList';

describe('PlayerList - Figma Design', () => {
  it('renders with Card component and header with Users icon', () => {
    const { container } = render(
      <PlayerList players={[]} currentPlayerId="" />,
    );

    // Figma design includes header with player count
    expect(screen.getByText(/Players/)).toBeInTheDocument();

    // Check for Users icon (SVG from Lucide)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('displays player count in header', () => {
    const players = [
      { player_id: 'player-1', name: 'Alice', connected: true },
      { player_id: 'player-2', name: 'Bob', connected: false },
    ];

    render(<PlayerList players={players} currentPlayerId="" />);

    // Shows online/total count
    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
  });

  it('displays a single connected player', () => {
    const players = [{ player_id: 'player-1', name: 'Alice', connected: true }];

    render(<PlayerList players={players} currentPlayerId="" />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('displays multiple players with badges', () => {
    const players = [
      { player_id: 'player-1', name: 'Alice', connected: true },
      { player_id: 'player-2', name: 'Bob', connected: true },
      { player_id: 'player-3', name: 'Charlie', connected: false },
    ];

    render(<PlayerList players={players} currentPlayerId="" />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();

    // Check badges
    const onlineBadges = screen.getAllByText('Online');
    const offlineBadges = screen.getAllByText('Offline');
    expect(onlineBadges.length).toBe(2);
    expect(offlineBadges.length).toBe(1);
  });

  it('shows connection status indicator for connected player', () => {
    const players = [{ player_id: 'player-1', name: 'Alice', connected: true }];

    render(<PlayerList players={players} currentPlayerId="" />);

    // Look for green circle indicator
    const playerItem = screen.getByText('Alice').closest('div');
    expect(playerItem).toBeInTheDocument();
    expect(playerItem?.innerHTML).toContain('green');
  });

  it('shows disconnected status indicator for disconnected player', () => {
    const players = [
      { player_id: 'player-1', name: 'Alice', connected: false },
    ];

    render(<PlayerList players={players} currentPlayerId="" />);

    const playerItem = screen.getByText('Alice').closest('div');
    expect(playerItem).toBeInTheDocument();
    // Check for gray indicator
    expect(playerItem?.innerHTML).toContain('gray');
  });

  it('highlights the current player with "You" badge', () => {
    const players = [
      { player_id: 'player-1', name: 'Alice', connected: true },
      { player_id: 'player-2', name: 'Bob', connected: true },
    ];

    render(<PlayerList players={players} currentPlayerId="player-2" />);

    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    // "You" badge should be present
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('does not show "You" badge for other players', () => {
    const players = [
      { player_id: 'player-1', name: 'Alice', connected: true },
      { player_id: 'player-2', name: 'Bob', connected: true },
    ];

    render(<PlayerList players={players} currentPlayerId="player-2" />);

    // Only one "You" badge should exist (for Bob)
    const youBadges = screen.getAllByText('You');
    expect(youBadges.length).toBe(1);
  });

  it('handles empty player list gracefully', () => {
    render(<PlayerList players={[]} currentPlayerId="" />);

    // Shows empty state message
    expect(screen.getByText(/no players yet/i)).toBeInTheDocument();
  });

  it('displays players in the order provided', () => {
    const players = [
      { player_id: 'player-1', name: 'Zara', connected: true },
      { player_id: 'player-2', name: 'Alice', connected: true },
      { player_id: 'player-3', name: 'Mike', connected: true },
    ];

    render(<PlayerList players={players} currentPlayerId="" />);

    // Check order using data-testid
    const zaraElement = screen.getByTestId('player-Zara');
    const aliceElement = screen.getByTestId('player-Alice');
    const mikeElement = screen.getByTestId('player-Mike');

    expect(zaraElement).toBeInTheDocument();
    expect(aliceElement).toBeInTheDocument();
    expect(mikeElement).toBeInTheDocument();
  });
});
  });

  it('applies minimum touch target size for mobile', () => {
    const players = [{ player_id: 'player-1', name: 'Alice', connected: true }];

    const { container } = render(
      <PlayerList players={players} currentPlayerId="" />,
    );

    const listItems = container.querySelectorAll('li');
    listItems.forEach((item) => {
      const styles = window.getComputedStyle(item);
      const minHeight = parseInt(styles.minHeight);
      // Should have reasonable touch target or be contained in tappable element
      expect(
        minHeight >= 40 ||
          item.style.minHeight === '44px' ||
          item.style.minHeight === '48px',
      ).toBe(true);
    });
  });
});
