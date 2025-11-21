/**
 * Socket State Store using Zustand
 *
 * Manages WebSocket connection state and messages.
 */

import { create } from 'zustand';

interface SocketState {
  isConnected: boolean;
  connectionMessage: string | null;
  connectionError: string | null;
  setConnected: (connected: boolean) => void;
  setConnectionMessage: (message: string | null) => void;
  setConnectionError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  isConnected: false,
  connectionMessage: null,
  connectionError: null,
};

export const useSocketStore = create<SocketState>((set) => ({
  ...initialState,

  setConnected: (connected: boolean) => set({ isConnected: connected }),

  setConnectionMessage: (message: string | null) =>
    set({ connectionMessage: message }),

  setConnectionError: (error: string | null) => set({ connectionError: error }),

  reset: () => set(initialState),
}));
