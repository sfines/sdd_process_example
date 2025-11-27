import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Toast from '../components/Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render when no toast is shown', () => {
    render(<Toast />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays success toast on toast:show event', () => {
    render(<Toast />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: { type: 'success', message: 'Room created!' },
        }),
      );
    });

    expect(screen.getByText('Room created!')).toBeInTheDocument();
  });

  it('displays error toast on toast:show event', () => {
    render(<Toast />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: { type: 'error', message: 'Failed to create room' },
        }),
      );
    });

    expect(screen.getByText('Failed to create room')).toBeInTheDocument();
  });

  it('auto-dismisses after 5 seconds', () => {
    render(<Toast />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: { type: 'success', message: 'Test message' },
        }),
      );
    });

    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Fast-forward 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('applies success styling', () => {
    render(<Toast />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: { type: 'success', message: 'Success!' },
        }),
      );
    });

    const toast = screen.getByRole('alert');
    expect(
      toast.className.includes('green') || toast.className.includes('success'),
    ).toBe(true);
  });

  it('applies error styling', () => {
    render(<Toast />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: { type: 'error', message: 'Error!' },
        }),
      );
    });

    const toast = screen.getByRole('alert');
    expect(
      toast.className.includes('red') || toast.className.includes('error'),
    ).toBe(true);
  });
});
