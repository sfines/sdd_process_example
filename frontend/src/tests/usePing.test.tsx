/**
 * usePing Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePing } from '../hooks/usePing';

// Mock socket
vi.mock('../services/socket', () => ({
  socket: {
    connected: true,
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

import { socket } from '../services/socket';

describe('usePing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    (socket.connected as boolean) = true;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should emit ping on start', () => {
    const { result } = renderHook(() => usePing({ enabled: false }));

    act(() => {
      result.current.startPinging();
    });

    expect(socket.emit).toHaveBeenCalledWith('ping', {});
  });

  it('should emit ping at regular intervals', () => {
    const interval = 30000;
    const { result } = renderHook(() => usePing({ interval, enabled: false }));

    act(() => {
      result.current.startPinging();
    });

    // Initial ping
    expect(socket.emit).toHaveBeenCalledTimes(1);

    // Advance time by one interval
    act(() => {
      vi.advanceTimersByTime(interval);
    });

    expect(socket.emit).toHaveBeenCalledTimes(2);

    // Advance time by another interval
    act(() => {
      vi.advanceTimersByTime(interval);
    });

    expect(socket.emit).toHaveBeenCalledTimes(3);
  });

  it('should stop pinging when stopPinging is called', () => {
    const interval = 30000;
    const { result } = renderHook(() => usePing({ interval, enabled: false }));

    act(() => {
      result.current.startPinging();
    });

    expect(socket.emit).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.stopPinging();
    });

    // Advance time - should not emit more pings
    act(() => {
      vi.advanceTimersByTime(interval * 3);
    });

    expect(socket.emit).toHaveBeenCalledTimes(1);
  });

  it('should not emit ping when socket is disconnected', () => {
    (socket.connected as boolean) = false;

    const { result } = renderHook(() => usePing({ enabled: false }));

    act(() => {
      result.current.startPinging();
    });

    expect(socket.emit).not.toHaveBeenCalled();
  });

  it('should register pong listener', () => {
    renderHook(() => usePing({ enabled: false }));

    expect(socket.on).toHaveBeenCalledWith('pong', expect.any(Function));
  });

  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => usePing({ enabled: false }));

    unmount();

    // Verify pong listener is cleaned up
    expect(socket.off).toHaveBeenCalledWith('pong', expect.any(Function));
  });
});
