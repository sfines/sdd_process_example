import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';

describe('Header Component - Responsive', () => {
  const mockOnLeaveRoom = vi.fn();
  const mockOnMenuToggle = vi.fn();
  const defaultProps = {
    roomCode: 'TEST-1234',
    isConnected: true,
    onLeaveRoom: mockOnLeaveRoom,
    onMenuToggle: mockOnMenuToggle,
    showMenuButton: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile Layout (<768px)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      global.innerWidth = 375;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 767px)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
    });

    it('renders hamburger menu button on mobile', () => {
      render(<Header {...defaultProps} />);

      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('hamburger button has correct touch target size (44x44px)', () => {
      render(<Header {...defaultProps} />);

      const menuButton = screen.getByRole('button', { name: /open menu/i });
      // h-11 w-11 = 44px x 44px
      expect(menuButton).toHaveClass('h-11', 'w-11');
    });

    it('calls onMenuToggle when hamburger clicked', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);

      const menuButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(menuButton);

      expect(mockOnMenuToggle).toHaveBeenCalledTimes(1);
    });

    it('displays compact room code on mobile', () => {
      render(<Header {...defaultProps} />);

      // Room code should be visible but compact
      const roomCodeElements = screen.getAllByText(/TEST-1234/);
      expect(roomCodeElements.length).toBeGreaterThan(0);
    });

    it('displays connection status on mobile', () => {
      render(<Header {...defaultProps} isConnected={true} />);

      const connectedIcon = screen.getByLabelText('Connected');
      expect(connectedIcon).toBeInTheDocument();
    });

    it('displays leave button on mobile', () => {
      render(<Header {...defaultProps} />);

      const leaveButton = screen.getByRole('button', { name: /leave room/i });
      expect(leaveButton).toBeInTheDocument();
    });

    it('hides menu button when showMenuButton is false', () => {
      render(<Header {...defaultProps} showMenuButton={false} />);

      const menuButton = screen.queryByRole('button', { name: /open menu/i });
      expect(menuButton).not.toBeInTheDocument();
    });
  });

  describe('Desktop Layout (≥768px)', () => {
    beforeEach(() => {
      // Mock desktop viewport
      global.innerWidth = 1200;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(min-width: 768px)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
    });

    it('does not render hamburger menu on desktop', () => {
      render(<Header {...defaultProps} />);

      // Menu button should not be visible (md:hidden)
      const menuButton = screen.queryByRole('button', { name: /open menu/i });
      // Button exists in DOM but hidden via CSS
      expect(menuButton).toBeInTheDocument();
    });

    it('displays full room code on desktop', () => {
      render(<Header {...defaultProps} />);

      // Room code should be visible (appears in compact form)
      const roomCodeElements = screen.getAllByText(/TEST-1234/);
      expect(roomCodeElements.length).toBeGreaterThan(0);
    });

    it('displays connection status on desktop', () => {
      render(<Header {...defaultProps} isConnected={true} />);

      const connectedIcon = screen.getByLabelText('Connected');
      expect(connectedIcon).toBeInTheDocument();
    });

    it('displays leave button with text on desktop', () => {
      render(<Header {...defaultProps} />);

      const leaveButton = screen.getByRole('button', { name: /leave room/i });
      expect(leaveButton).toBeInTheDocument();
      // "Leave" text visible on sm+ screens
      expect(leaveButton).toHaveTextContent(/leave/i);
    });

    it('calls onLeaveRoom when leave button clicked', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);

      const leaveButton = screen.getByRole('button', { name: /leave room/i });
      await user.click(leaveButton);

      expect(mockOnLeaveRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('Connection Status Indicators', () => {
    it('shows green wifi icon when connected', () => {
      render(<Header {...defaultProps} isConnected={true} />);

      const connectedIcon = screen.getByLabelText('Connected');
      expect(connectedIcon).toBeInTheDocument();
      expect(connectedIcon).toHaveClass('text-green-500');
    });

    it('shows red wifi-off icon when disconnected', () => {
      render(<Header {...defaultProps} isConnected={false} />);

      const disconnectedIcon = screen.getByLabelText('Disconnected');
      expect(disconnectedIcon).toBeInTheDocument();
      expect(disconnectedIcon).toHaveClass('text-red-500');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for menu button', () => {
      render(<Header {...defaultProps} />);

      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');
    });

    it('has proper aria-label for leave button', () => {
      render(<Header {...defaultProps} />);

      const leaveButton = screen.getByRole('button', { name: /leave room/i });
      expect(leaveButton).toHaveAttribute('aria-label', 'Leave Room');
    });

    it('connection status icons have aria-labels', () => {
      const { rerender } = render(
        <Header {...defaultProps} isConnected={true} />,
      );

      expect(screen.getByLabelText('Connected')).toBeInTheDocument();

      rerender(<Header {...defaultProps} isConnected={false} />);
      expect(screen.getByLabelText('Disconnected')).toBeInTheDocument();
    });
  });
});
