import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';

describe('Header Component', () => {
  const defaultProps = {
    roomCode: 'TEST-1234',
    isConnected: true,
    onLeaveRoom: vi.fn(),
  };

  describe('Responsive Layout', () => {
    it('renders room code on all screen sizes', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('TEST-1234')).toBeInTheDocument();
    });

    it('shows connection status indicator', () => {
      const { rerender } = render(<Header {...defaultProps} />);
      expect(screen.getByLabelText('Connected')).toBeInTheDocument();

      rerender(<Header {...defaultProps} isConnected={false} />);
      expect(screen.getByLabelText('Disconnected')).toBeInTheDocument();
    });

    it('renders leave room button with accessibility label', () => {
      render(<Header {...defaultProps} />);
      const leaveButton = screen.getByLabelText('Leave Room');
      expect(leaveButton).toBeInTheDocument();
    });

    it('calls onLeaveRoom when leave button clicked', () => {
      const onLeaveRoom = vi.fn();
      render(<Header {...defaultProps} onLeaveRoom={onLeaveRoom} />);

      const leaveButton = screen.getByLabelText('Leave Room');
      fireEvent.click(leaveButton);

      expect(onLeaveRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mobile Hamburger Menu', () => {
    it('shows hamburger menu button when showMenuButton is true', () => {
      render(<Header {...defaultProps} showMenuButton={true} onMenuToggle={vi.fn()} />);
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('hides hamburger menu button when showMenuButton is false', () => {
      render(<Header {...defaultProps} showMenuButton={false} />);
      expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
    });

    it('calls onMenuToggle when hamburger button clicked', () => {
      const onMenuToggle = vi.fn();
      render(<Header {...defaultProps} showMenuButton={true} onMenuToggle={onMenuToggle} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      expect(onMenuToggle).toHaveBeenCalledTimes(1);
    });

    it('hamburger button has minimum 44x44px touch target', () => {
      render(<Header {...defaultProps} showMenuButton={true} onMenuToggle={vi.fn()} />);
      const menuButton = screen.getByLabelText('Open menu');

      // Check for h-11 w-11 classes (44px)
      expect(menuButton.className).toMatch(/h-11/);
      expect(menuButton.className).toMatch(/w-11/);
    });
  });

  describe('Responsive Text', () => {
    it('leave button has responsive text visibility classes', () => {
      render(<Header {...defaultProps} />);
      const leaveButton = screen.getByLabelText('Leave Room');

      // Should have "Leave" text with responsive classes
      const textElement = leaveButton.querySelector('.hidden.sm\\:inline');
      expect(textElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic header element', () => {
      const { container } = render(<Header {...defaultProps} />);
      expect(container.querySelector('header')).toBeInTheDocument();
    });

    it('connection status icons have proper ARIA labels', () => {
      const { rerender } = render(<Header {...defaultProps} isConnected={true} />);
      expect(screen.getByLabelText('Connected')).toBeInTheDocument();

      rerender(<Header {...defaultProps} isConnected={false} />);
      expect(screen.getByLabelText('Disconnected')).toBeInTheDocument();
    });
  });
});
