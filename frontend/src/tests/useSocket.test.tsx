/**
 * useSocket Hook Tests
 *
 * Tests for the useSocket hook, focusing on join room functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

  afterEach(() => {
    // Clean up event listeners
    const events = ['socket:joinRoom'];
    events.forEach(event => {
      const listeners = (window as any)._eventListeners?.[event] || [];
      listeners.forEach((listener: EventListener) => {
        window.removeEventListener(event, listener);
      });
    });
  });

  it('registers listener for socket:joinRoom custom event', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    
    renderHook(() => useSocket(), { wrapper });

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'socket:joinRoom',
      expect.any(Function),
    );
  });

  it('emits join_room event when socket:joinRoom is dispatched', async () => {
    renderHook(() => useSocket(), { wrapper });

    // Find the registered listener
    const calls = (window.addEventListener as any).mock.calls;
    const joinRoomCall = calls.find((call: any[]) => call[0] === 'socket:joinRoom');
    const listener = joinRoomCall?.[1];

    expect(listener).toBeDefined();

    // Dispatch event
    const event = new CustomEvent('socket:joinRoom', {
      detail: { roomCode: 'ALPHA-1234', playerName: 'TestPlayer' },
    });
    
    await act(async () => {
      listener(event);
    });

    expect(socket.emit).toHaveBeenCalledWith('join_room', {
      room_code: 'ALPHA-1234',
      player_name: 'TestPlayer',
    });
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
    });

    expect(mockNavigate).toHaveBeenCalledWith('/room/ALPHA-1234');
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

  it('cleans up join room listeners on unmount', () => {
    const { unmount } = renderHook(() => useSocket(), { wrapper });
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'socket:joinRoom',
      expect.any(Function),
    );
    expect(socket.off).toHaveBeenCalledWith('room_joined', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('player_joined', expect.any(Function));
  });
});
