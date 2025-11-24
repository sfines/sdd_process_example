/**
 * Socket.IO Client Configuration
 *
 * Establishes WebSocket connection to backend server.
 */

import { io, Socket } from 'socket.io-client';

// Configure socket connection
// Use dynamic hostname so it works from any IP/hostname
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

export const socket: Socket = io(SOCKET_URL, {
  path: '/socket.io',
  transports: ['websocket'], // Force WebSocket transport
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Expose socket on window for Playwright debugging
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).socket = socket;

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
