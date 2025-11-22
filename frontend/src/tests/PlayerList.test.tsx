/**
 * PlayerList Component Tests
 *
 * Tests for the PlayerList component showing connected players and their status.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlayerList from '../components/PlayerList';

describe('PlayerList', () => {
  it('renders the player list heading', () => {
    const { container } = render(
      <PlayerList players={[]} currentPlayerId="" />,
    );

    const heading = container.querySelector('h2');
    expect(heading).toHaveTextContent(/players/i);
  });

  it('displays a single connected player', () => {
    const players = [{ player_id: 'player-1', name: 'Alice', connected: true }];

    render(<PlayerList players={players} currentPlayerId="" />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('displays multiple players', () => {
    const players = [
      { player_id: 'player-1', name: 'Alice', connected: true },
      { player_id: 'player-2', name: 'Bob', connected: true },
      { player_id: 'player-3', name: 'Charlie', connected: false },
    ];

    render(<PlayerList players={players} currentPlayerId="" />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows connection status indicator for connected player', () => {
    const players = [{ player_id: 'player-1', name: 'Alice', connected: true }];

    render(<PlayerList players={players} currentPlayerId="" />);

    // Look for green circle or "connected" indicator
    const listItem = screen.getByText('Alice').closest('li');
    expect(listItem).toBeInTheDocument();
    // Check for presence of connected status indicator (green circle)
    expect(listItem?.innerHTML).toContain('green');
  });

  it('shows disconnected status indicator for disconnected player', () => {
    const players = [
      { player_id: 'player-1', name: 'Alice', connected: false },
    ];

    render(<PlayerList players={players} currentPlayerId="" />);

    const listItem = screen.getByText('Alice').closest('li');
    expect(listItem).toBeInTheDocument();
    // Check for presence of disconnected status indicator (gray/red circle)
    expect(listItem?.innerHTML).toMatch(/gray|red/);
  });

  it('highlights the current player with "You" label', () => {
    const players = [
      { player_id: 'player-1', name: 'Alice', connected: true },
      { player_id: 'player-2', name: 'Bob', connected: true },
    ];

    render(<PlayerList players={players} currentPlayerId="player-2" />);

    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    expect(screen.getByText(/you/i)).toBeInTheDocument();
  });

  it('does not show "You" label for other players', () => {
    const players = [
      { player_id: 'player-1', name: 'Alice', connected: true },
      { player_id: 'player-2', name: 'Bob', connected: true },
    ];

    render(<PlayerList players={players} currentPlayerId="player-2" />);

    const aliceElement = screen.getByText('Alice');
    expect(aliceElement.parentElement?.textContent).not.toContain('You');
  });

  it('handles empty player list gracefully', () => {
    const { container } = render(
      <PlayerList players={[]} currentPlayerId="" />,
    );

    const heading = container.querySelector('h2');
    expect(heading).toHaveTextContent(/players/i);
    // Should not crash, shows empty state or just the heading
  });

  it('displays players in the order provided', () => {
    const players = [
      { player_id: 'player-1', name: 'Zara', connected: true },
      { player_id: 'player-2', name: 'Alice', connected: true },
      { player_id: 'player-3', name: 'Mike', connected: true },
    ];

    render(<PlayerList players={players} currentPlayerId="" />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveTextContent('Zara');
    expect(listItems[1]).toHaveTextContent('Alice');
    expect(listItems[2]).toHaveTextContent('Mike');
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
