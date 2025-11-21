import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomCodeDisplay from '../components/RoomCodeDisplay';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

describe('RoomCodeDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders room code prominently', () => {
    render(<RoomCodeDisplay roomCode="ALPHA-1234" />);

    expect(screen.getByText('ALPHA-1234')).toBeInTheDocument();
  });

  it('displays room code in monospace font', () => {
    render(<RoomCodeDisplay roomCode="BRAVO-5678" />);

    const codeElement = screen.getByText('BRAVO-5678');
    const styles = window.getComputedStyle(codeElement);

    // Check for monospace or font-mono class
    expect(
      codeElement.className.includes('font-mono') ||
        styles.fontFamily.includes('mono'),
    ).toBe(true);
  });

  it('has a copy button', () => {
    render(<RoomCodeDisplay roomCode="CHARLIE-9999" />);

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('copy button has minimum 44px height', () => {
    render(<RoomCodeDisplay roomCode="DELTA-0000" />);

    const button = screen.getByRole('button', { name: /copy/i });

    // Check inline style or class that sets min-height
    expect(
      button.style.minHeight === '44px' ||
        button.style.minHeight === '48px' ||
        button.className.includes('h-11') ||
        button.className.includes('h-12'),
    ).toBe(true);
  });

  it('copies room code to clipboard when button clicked', async () => {
    render(<RoomCodeDisplay roomCode="ECHO-1111" />);

    const button = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ECHO-1111');
    });
  });

  it('shows "Copied!" feedback after copying', async () => {
    render(<RoomCodeDisplay roomCode="FOXTROT-2222" />);

    const button = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it('reverts button text after 2 seconds', async () => {
    render(<RoomCodeDisplay roomCode="GOLF-3333" />);

    const button = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(button);

    // Wait for the "Copied!" text to appear
    await waitFor(() => expect(screen.queryByText(/copied/i)).toBeInTheDocument());

    // Wait 2 seconds for revert
    await waitFor(
      () => {
        expect(screen.getByText(/copy/i)).toBeInTheDocument();
        expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
