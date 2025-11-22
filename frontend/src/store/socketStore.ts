/**
 * Socket State Store using Zustand
 *
 * Manages WebSocket connection state and messages.
 */

import { create } from 'zustand';
import { socket } from '../services/socket';

interface Player {
  player_id: string;
  name: string;
  connected: boolean;
}

interface SocketState {
  isConnected: boolean;
  connectionMessage: string | null;
  connectionError: string | null;
  roomCode: string | null;
  roomMode: 'Open' | 'DM-Led' | null;
  creatorPlayerId: string | null;
  currentPlayerId: string | null;
  players: Player[];
  rollHistory: unknown[];
  roomState?: {
    room_code: string;
    mode: string;
    creator_player_id: string;
    players: Player[];
    roll_history: unknown[];
  };
  setConnected: (connected: boolean) => void;
  setConnectionMessage: (message: string | null) => void;
  setConnectionError: (error: string | null) => void;
  setRoomState: (roomState: {
    room_code: string;
    mode: string;
    creator_player_id: string;
    players: Player[];
    roll_history: unknown[];
  }) => void;
  setCurrentPlayerId: (playerId: string) => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  reset: () => void;
}

const initialState = {
  isConnected: false,
  connectionMessage: null,
  connectionError: null,
  roomCode: null,
  roomMode: null,
  creatorPlayerId: null,
  currentPlayerId: null,
  players: [],
  rollHistory: [],
};

export const useSocketStore = create<SocketState>((set) => ({
  ...initialState,

  setConnected: (connected: boolean) => set({ isConnected: connected }),

  setConnectionMessage: (message: string | null) =>
    set({ connectionMessage: message }),

  setConnectionError: (error: string | null) => set({ connectionError: error }),

  setRoomState: (roomState) =>
    set({
      roomCode: roomState.room_code,
      roomMode: roomState.mode as 'Open' | 'DM-Led',
      creatorPlayerId: roomState.creator_player_id,
      players: roomState.players,
      rollHistory: roomState.roll_history,
      roomState: roomState,
    }),

  setCurrentPlayerId: (playerId: string) => set({ currentPlayerId: playerId }),

  createRoom: (playerName: string) => {
    set({ connectionError: null });
    // Directly emit socket event
    socket.emit('create_room', { player_name: playerName });
  },

  joinRoom: (roomCode: string, playerName: string) => {
    set({ connectionError: null });
    // Directly emit socket event
    socket.emit('join_room', {
      room_code: roomCode,
      player_name: playerName,
    });
  },

  reset: () => set(initialState),
}));