import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NavigationDrawer from '../components/NavigationDrawer';

describe('NavigationDrawer Component', () => {
  const defaultProps = {
    isOpen: false,
    onClose: vi.fn(),
    roomCode: 'TEST-1234',
    playerName: 'TestPlayer',
    onLeaveRoom: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset body overflow after each test
    document.body.style.overflow = 'unset';
  });

  describe('Visibility', () => {
    it('does not render when isOpen is false', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('displays room code section', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Room Code')).toBeInTheDocument();
      expect(screen.getByText('TEST-1234')).toBeInTheDocument();
    });

    it('displays player name', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Player')).toBeInTheDocument();
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });

    it('displays leave room button', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Leave Room')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<NavigationDrawer {...defaultProps} isOpen={true} onClose={onClose} />);

      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay clicked', () => {
      const onClose = vi.fn();
      render(<NavigationDrawer {...defaultProps} isOpen={true} onClose={onClose} />);

      const overlay = screen.getByLabelText('Close menu');
      fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls both onLeaveRoom and onClose when leave button clicked', () => {
      const onLeaveRoom = vi.fn();
      const onClose = vi.fn();
      render(<NavigationDrawer {...defaultProps} isOpen={true} onLeaveRoom={onLeaveRoom} onClose={onClose} />);

      const leaveButton = screen.getByText('Leave Room');
      fireEvent.click(leaveButton);

      expect(onLeaveRoom).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes drawer on Escape key press', async () => {
      const onClose = vi.fn();
      render(<NavigationDrawer {...defaultProps} isOpen={true} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Body Scroll Lock', () => {
    it('locks body scroll when drawer opens', () => {
      const { rerender } = render(<NavigationDrawer {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('unset');

      rerender(<NavigationDrawer {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('unlocks body scroll when drawer closes', () => {
      const { rerender } = render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<NavigationDrawer {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Responsive Styling', () => {
    it('drawer is hidden on desktop (md:hidden)', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const drawer = screen.getByRole('dialog');
      expect(drawer.className).toMatch(/md:hidden/);
    });

    it('overlay is hidden on desktop (md:hidden)', () => {
      const { container } = render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(overlay?.className).toMatch(/md:hidden/);
    });

    it('drawer width is 80vw with max 300px', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const drawer = screen.getByRole('dialog');
      expect(drawer.className).toMatch(/w-\[80vw\]/);
      expect(drawer.className).toMatch(/max-w-\[300px\]/);
    });
  });

  describe('Animation', () => {
    it('drawer has slide transition classes', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const drawer = screen.getByRole('dialog');
      expect(drawer.className).toMatch(/transition-transform/);
      expect(drawer.className).toMatch(/duration-200/);
      expect(drawer.className).toMatch(/ease-in-out/);
    });

    it('drawer translates to 0 when open', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const drawer = screen.getByRole('dialog');
      expect(drawer.className).toMatch(/translate-x-0/);
    });
  });

  describe('Accessibility', () => {
    it('uses semantic aside element with dialog role', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const drawer = screen.getByRole('dialog');
      expect(drawer.tagName).toBe('ASIDE');
    });

    it('drawer has aria-modal attribute', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const drawer = screen.getByRole('dialog');
      expect(drawer.getAttribute('aria-modal')).toBe('true');
    });

    it('drawer has aria-label', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const drawer = screen.getByRole('dialog');
      expect(drawer.getAttribute('aria-label')).toBe('Navigation menu');
    });

    it('close button has 44x44px touch target', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const closeButton = screen.getAllByLabelText('Close menu')[1]; // Get button, not overlay
      expect(closeButton.className).toMatch(/h-10/);
      expect(closeButton.className).toMatch(/w-10/);
    });
  });

  describe('Z-Index Layering', () => {
    it('overlay has z-index 1000', () => {
      const { container } = render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(overlay?.className).toMatch(/z-\[1000\]/);
    });

    it('drawer has z-index 1001', () => {
      render(<NavigationDrawer {...defaultProps} isOpen={true} />);
      const drawer = screen.getByRole('dialog');
      expect(drawer.className).toMatch(/z-\[1001\]/);
    });
  });
});
