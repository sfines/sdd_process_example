/**
 * Socket State Store using Zustand
 *
 * Manages WebSocket connection state and messages.
 */

import { create } from 'zustand';

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
  players: Player[];
  rollHistory: unknown[];
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
  createRoom: (playerName: string) => void;
  reset: () => void;
}

const initialState = {
  isConnected: false,
  connectionMessage: null,
  connectionError: null,
  roomCode: null,
  roomMode: null,
  creatorPlayerId: null,
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
    }),

  createRoom: (playerName: string) => {
    // This will be called by the component
    // The actual socket emission happens in useSocket hook
    set({ connectionError: null });
    // Hook will listen for this action
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('socket:createRoom', { detail: { playerName } }),
      );
    }
  },

  reset: () => set(initialState),
}));

export default useSocketStore;