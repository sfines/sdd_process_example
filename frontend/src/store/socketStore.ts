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

interface DiceResult {
  roll_id: string;
  player_id: string;
  player_name: string;
  formula: string;
  individual_results: number[];
  modifier: number;
  total: number;
  timestamp: string;
  dc_pass?: boolean | null;
}

interface SocketState {
  isConnected: boolean;
  connectionMessage: string | null;
  connectionError: string | null;
  roomCode: string | null;
  roomMode: 'Open' | 'DM-Led' | null;
  creatorPlayerId: string | null;
  currentPlayerId: string | null;
  currentPlayerName: string | null;
  players: Player[];
  rollHistory: DiceResult[];
  roomState?: {
    room_code: string;
    mode: string;
    creator_player_id: string;
    players: Player[];
    roll_history: DiceResult[];
  };
  setConnected: (connected: boolean) => void;
  setConnectionMessage: (message: string | null) => void;
  setConnectionError: (error: string | null) => void;
  setRoomState: (roomState: {
    room_code: string;
    mode: string;
    creator_player_id: string;
    players: Player[];
    roll_history: DiceResult[];
  }) => void;
  setCurrentPlayerId: (playerId: string) => void;
  setCurrentPlayerName: (name: string) => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  rollDice: (formula: string, playerName: string, roomCode: string) => void;
  addRollToHistory: (roll: DiceResult) => void;
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
  currentPlayerName: null,
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
    set((state) => ({
      ...state,  // CRITICAL: Spread existing state first to preserve everything
      roomCode: roomState.room_code,
      roomMode: roomState.mode as 'Open' | 'DM-Led',
      creatorPlayerId: roomState.creator_player_id,
      players: roomState.players,
      rollHistory: roomState.roll_history,
      roomState: roomState,
    })),

  setCurrentPlayerId: (playerId: string) => set({ currentPlayerId: playerId }),
  setCurrentPlayerName: (name: string) => set({ currentPlayerName: name }),
  createRoom: (playerName: string) => {
    // CRITICAL: Set player name FIRST before any async operations
    set({ 
      connectionError: null, 
      currentPlayerName: playerName 
    });
    // Emit socket event
    socket.emit('create_room', { player_name: playerName });
  },

  joinRoom: (roomCode: string, playerName: string) => {
    // CRITICAL: Set player name FIRST before any async operations
    set({ 
      connectionError: null, 
      currentPlayerName: playerName 
    });
    // Emit socket event
    socket.emit('join_room', {
      room_code: roomCode,
      player_name: playerName,
    });
  },

  rollDice: (formula: string, playerName: string, roomCode: string) => {
    // Emit roll_dice event to backend
    socket.emit('roll_dice', {
      formula,
      player_name: playerName,
      room_code: roomCode,
    });
  },

  addRollToHistory: (roll: DiceResult) => {
    set((state) => ({
      rollHistory: [...state.rollHistory, roll],
    }));
  },

  reset: () => set(initialState),
}));
