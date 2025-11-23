/**
 * useSocket Hook Tests
 *
 * Tests for the useSocket hook, focusing on join room functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { socket } from '../services/socket';
import type { ReactNode } from 'react';

// Mock the socket
vi.mock('../services/socket', () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('useSocket - Join Room', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('store joinRoom method emits join_room socket event', async () => {
    const { result } = renderHook(() => useSocket(), { wrapper });

    await act(async () => {
      result.current.joinRoom('ALPHA-1234', 'TestPlayer');
    });

    expect(socket.emit).toHaveBeenCalledWith('join_room', {
      room_code: 'ALPHA-1234',
      player_name: 'TestPlayer',
    });
  });

  it('store joinRoom method clears connection error', async () => {
    const { result } = renderHook(() => useSocket(), { wrapper });

    // Set an error first
    act(() => {
      result.current.setConnectionError('Previous error');
    });

    expect(result.current.connectionError).toBe('Previous error');

    // Join room should clear the error
    await act(async () => {
      result.current.joinRoom('ALPHA-1234', 'TestPlayer');
    });

    expect(result.current.connectionError).toBeNull();
  });

  it('registers listener for room_joined event from server', () => {
    renderHook(() => useSocket(), { wrapper });

    expect(socket.on).toHaveBeenCalledWith('room_joined', expect.any(Function));
  });

  it('updates room state and navigates on room_joined', async () => {
    const { result } = renderHook(() => useSocket(), { wrapper });

    // Find the registered room_joined listener
    const calls = (socket.on as any).mock.calls;
    const roomJoinedCall = calls.find((call: any[]) => call[0] === 'room_joined');
    const listener = roomJoinedCall?.[1];

    expect(listener).toBeDefined();

    const roomData = {
      room_code: 'ALPHA-1234',
      mode: 'standard',
      creator_player_id: 'player-1',
      players: [
        { player_id: 'player-1', name: 'Creator', connected: true },
        { player_id: 'player-2', name: 'Joiner', connected: true },
      ],
      roll_history: [],
    };

    await act(async () => {
      listener(roomData);
    });

    await waitFor(() => {
      expect(result.current.roomState).toEqual(roomData);
      expect(mockNavigate).toHaveBeenCalledWith('/room/ALPHA-1234');
    });
  });

  it('dispatches success toast on room_joined', async () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    renderHook(() => useSocket(), { wrapper });

    const calls = (socket.on as any).mock.calls;
    const roomJoinedCall = calls.find((call: any[]) => call[0] === 'room_joined');
    const listener = roomJoinedCall?.[1];

    const roomData = {
      room_code: 'ALPHA-1234',
      mode: 'standard',
      creator_player_id: 'player-1',
      players: [
        { player_id: 'player-1', name: 'Creator', connected: true },
        { player_id: 'player-2', name: 'Joiner', connected: true },
      ],
      roll_history: [],
    };

    await act(async () => {
      listener(roomData);
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'toast:show',
        detail: {
          type: 'success',
          message: 'Successfully joined room ALPHA-1234',
        },
      }),
    );
  });

  it('registers listener for player_joined broadcast event', () => {
    renderHook(() => useSocket(), { wrapper });

    expect(socket.on).toHaveBeenCalledWith('player_joined', expect.any(Function));
  });

  it('updates room state when another player joins (player_joined)', async () => {
    const { result } = renderHook(() => useSocket(), { wrapper });

    // Set initial room state
    const initialRoom = {
      room_code: 'ALPHA-1234',
      mode: 'standard',
      creator_player_id: 'player-1',
      players: [{ player_id: 'player-1', name: 'Creator', connected: true }],
      roll_history: [],
    };

    act(() => {
      result.current.setRoomState(initialRoom);
    });

    // Find the player_joined listener
    const calls = (socket.on as any).mock.calls;
    const playerJoinedCall = calls.find((call: any[]) => call[0] === 'player_joined');
    const listener = playerJoinedCall?.[1];

    expect(listener).toBeDefined();

    const newPlayerData = {
      player_id: 'player-2',
      name: 'Joiner',
    };

    await act(async () => {
      listener(newPlayerData);
    });

    await waitFor(() => {
      const players = result.current.roomState?.players || [];
      expect(players).toHaveLength(2);
      expect(players[1]).toEqual({
        player_id: 'player-2',
        name: 'Joiner',
        connected: true,
      });
    });
  });

  it('dispatches info toast when player_joined broadcast received', async () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    const { result } = renderHook(() => useSocket(), { wrapper });

    const initialRoom = {
      room_code: 'ALPHA-1234',
      mode: 'standard',
      creator_player_id: 'player-1',
      players: [{ player_id: 'player-1', name: 'Creator', connected: true }],
      roll_history: [],
    };

    act(() => {
      result.current.setRoomState(initialRoom);
    });

    const calls = (socket.on as any).mock.calls;
    const playerJoinedCall = calls.find((call: any[]) => call[0] === 'player_joined');
    const listener = playerJoinedCall?.[1];

    const newPlayerData = {
      player_id: 'player-2',
      name: 'Joiner',
    };

    await act(async () => {
      listener(newPlayerData);
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'toast:show',
        detail: {
          type: 'info',
          message: 'Joiner joined the room',
        },
      }),
    );
  });

  it('cleans up socket listeners on unmount', () => {
    const { unmount } = renderHook(() => useSocket(), { wrapper });

    unmount();

    expect(socket.off).toHaveBeenCalledWith('room_joined', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('player_joined', expect.any(Function));
  });
});
