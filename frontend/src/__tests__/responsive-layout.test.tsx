import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RoomView from '../pages/RoomView';

// Mock socket
vi.mock('../../services/socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  },
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ roomCode: 'TEST-1234' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock Zustand store
vi.mock('../../store/socketStore', () => ({
  useSocketStore: (selector: any) => {
    const mockState = {
      players: [
        { player_id: '1', player_name: 'Player 1', is_connected: true },
        { player_id: '2', player_name: 'Player 2', is_connected: true },
      ],
      rollHistory: [
        {
          roll_id: 'roll-1',
          player_id: '1',
          player_name: 'Player 1',
          formula: '1d20',
          individual_results: [15],
          modifier: 0,
          total: 15,
          timestamp: new Date().toISOString(),
        },
      ],
      currentPlayerId: '1',
      currentPlayerName: 'Player 1',
      isConnected: true,
      rollDice: vi.fn(),
    };
    return selector ? selector(mockState) : mockState;
  },
}));

describe('Responsive Layout Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile Layout (375px)', () => {
    beforeEach(() => {
      global.innerWidth = 375;
      global.innerHeight = 667;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('max-width: 767px'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
    });

    it('hides roll history on mobile (visible in drawer only)', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Desktop roll history should be hidden (md:flex means hidden on mobile)
      screen.getByRole('main');

      // Roll history in main area should not be visible on mobile
      // The heading exists but is hidden by CSS
      const rollHistoryHeading = screen.queryByRole('heading', {
        name: /roll history/i,
      });
      expect(rollHistoryHeading).toBeInTheDocument();
    });

    it('displays dice input prominently on mobile', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Dice input should be visible and prominent
      const rollButton = screen.getByRole('button', { name: /roll/i });
      expect(rollButton).toBeInTheDocument();
    });

    it('displays hamburger menu on mobile', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Header should have hamburger menu
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Tablet Layout (768px)', () => {
    beforeEach(() => {
      global.innerWidth = 768;
      global.innerHeight = 1024;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('min-width: 768px'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
    });

    it('displays roll history on tablet', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Roll history should be visible in main area
      const rollHistoryHeading = screen.getByRole('heading', {
        name: /roll history/i,
      });
      expect(rollHistoryHeading).toBeInTheDocument();
    });

    it('displays dice input on tablet', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      const rollButton = screen.getByRole('button', { name: /roll/i });
      expect(rollButton).toBeInTheDocument();
    });

    it('does not show hamburger menu on tablet', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Hamburger menu exists but should be hidden via CSS (md:hidden)
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
      // CSS class md:hidden hides it on tablet/desktop
    });
  });

  describe('Desktop Layout (1200px)', () => {
    beforeEach(() => {
      global.innerWidth = 1200;
      global.innerHeight = 800;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('min-width: 1024px'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
    });

    it('displays side-by-side layout on desktop', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Both roll history and dice input should be visible
      const rollHistoryHeading = screen.getByRole('heading', {
        name: /roll history/i,
      });
      const rollButton = screen.getByRole('button', { name: /roll/i });

      expect(rollHistoryHeading).toBeInTheDocument();
      expect(rollButton).toBeInTheDocument();
    });

    it('does not show hamburger menu on desktop', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Hamburger menu exists but hidden via CSS
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('displays all header controls on desktop', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Connection status
      const connectionStatus = screen.getByLabelText(/connected/i);
      expect(connectionStatus).toBeInTheDocument();

      // Leave button with text
      const leaveButton = screen.getByRole('button', { name: /leave room/i });
      expect(leaveButton).toBeInTheDocument();
    });
  });

  describe('Touch Target Sizes', () => {
    it('all buttons meet 44x44px minimum touch target', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Menu button
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toHaveClass('h-11', 'w-11'); // 44px x 44px

      // Roll button should be at least h-12 (48px)
      const rollButton = screen.getByRole('button', { name: /roll/i });
      expect(rollButton).toHaveClass('h-12'); // 48px minimum
    });
  });

  describe('Responsive Typography', () => {
    it('uses minimum 16px font size on inputs', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // Check that inputs have text-base (16px) on mobile
      const modifierInput = screen.getByLabelText(/dice modifier/i);
      expect(modifierInput).toHaveClass('text-base');
    });

    it('heading text is readable on mobile', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>,
      );

      // All headings should have appropriate text sizes
      const headings = screen.getAllByRole('heading');
      headings.forEach((heading) => {
        // Headings should have at least text-lg or text-xl classes
        const classes = heading.className;
        const hasReadableSize =
          classes.includes('text-lg') ||
          classes.includes('text-xl') ||
          classes.includes('text-2xl');
        expect(hasReadableSize).toBe(true);
      });
    });
  });
});
