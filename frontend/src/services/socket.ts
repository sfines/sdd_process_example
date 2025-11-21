/**
 * Socket.IO Client Configuration
 *
 * Establishes WebSocket connection to backend server.
 */

import { io, Socket } from 'socket.io-client';

// Configure socket connection
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

export const socket: Socket = io(SOCKET_URL, {
  path: '/socket.io',
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Log connection events for debugging
socket.on('connect', () => {
  console.log('[Socket] Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('[Socket] Connection error:', error);
});

export default socket;
