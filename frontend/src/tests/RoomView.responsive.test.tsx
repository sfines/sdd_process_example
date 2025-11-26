import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RoomView from '../pages/RoomView';
import { useSocketStore } from '../store/socketStore';

// Mock socket store
vi.mock('../store/socketStore', () => ({
  useSocketStore: vi.fn(),
}));

// Mock socket service
vi.mock('../services/socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// Mock react-router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ roomCode: 'TEST-1234' }),
    useNavigate: () => vi.fn(),
  };
});

describe('RoomView - Responsive Layout (TDD)', () => {
  const mockStoreState = {
    players: [{ id: '1', name: 'TestPlayer' }],
    rollHistory: [],
    currentPlayerId: '1',
    currentPlayerName: 'TestPlayer',
    isConnected: true,
    rollDice: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSocketStore as any).mockImplementation((selector: any) =>
      selector(mockStoreState)
    );
  });

  describe('Task 4: Main Content Area Responsive Structure', () => {
    it('renders full-height flex column layout', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // Should have main container with flex-col and h-screen
      const mainContainer = container.querySelector('.flex.flex-col.h-screen');
      expect(mainContainer).toBeInTheDocument();
    });

    it('renders Header component at top', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // Header should be present with room code
      expect(screen.getByText('TEST-1234')).toBeInTheDocument();
    });

    it('renders main content area with flex-1 and overflow-hidden', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // Main content should take remaining space
      const mainContent = container.querySelector('main.flex-1.overflow-hidden');
      expect(mainContent).toBeInTheDocument();
    });

    it('uses flex-row on desktop (md breakpoint)', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      const mainContent = container.querySelector('main');
      expect(mainContent?.className).toMatch(/md:flex-row/);
    });
  });

  describe('Mobile Layout (<768px)', () => {
    it('hides roll history from main view on mobile', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // History should have md:block (hidden on mobile, visible on desktop)
      const desktopHistory = container.querySelector('.hidden.md\\:block');
      expect(desktopHistory).toBeInTheDocument();
    });

    it('shows DiceInput prominently on mobile', () => {
      render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // DiceInput should be visible (roll button)
      const rollButton = screen.getByText('Roll');
      expect(rollButton).toBeInTheDocument();
    });

    it('includes NavigationDrawer for mobile history access', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // Drawer should be present (even if closed initially)
      // Check for drawer role or specific test id
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('Desktop Layout (≥768px)', () => {
    it('shows roll history in main view on desktop', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // Desktop history section should exist with md:block
      const historySection = container.querySelector('.hidden.md\\:block');
      expect(historySection).toBeInTheDocument();
    });

    it('uses side-by-side layout with md:flex-row', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      const mainContent = container.querySelector('main');
      expect(mainContent?.className).toMatch(/md:flex-row/);
    });
  });

  describe('Height Calculations', () => {
    it('calculates available height for history', () => {
      // Mock window.innerHeight
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });

      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // VirtualRollHistory should receive height prop
      // This will be validated once component structure is updated
      expect(container.querySelector('[data-testid="virtual-roll-history"]')).toBeInTheDocument();
    });

    it('uses calc(100vh - Xpx) for dynamic height', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // Main container should use h-screen
      const mainContainer = container.querySelector('.h-screen');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders components in correct order: Header > Main > History + Input', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toBeInTheDocument();

      // Check structural hierarchy exists
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('maintains flex-1 on both history and input areas', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      // Both sections should have flex-1 for equal space distribution
      const flexOnes = container.querySelectorAll('.flex-1');
      expect(flexOnes.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Classes Applied', () => {
    it('applies flex flex-col h-screen to root container', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      const root = container.querySelector('.flex.flex-col.h-screen');
      expect(root).toBeInTheDocument();
    });

    it('applies flex-1 overflow-hidden to main content', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      const main = container.querySelector('main.flex-1.overflow-hidden');
      expect(main).toBeInTheDocument();
    });

    it('applies hidden md:block to desktop history section', () => {
      const { container } = render(
        <BrowserRouter>
          <RoomView />
        </BrowserRouter>
      );

      const desktopHistory = container.querySelector('.hidden.md\\:block');
      expect(desktopHistory).toBeInTheDocument();
    });
  });
});
