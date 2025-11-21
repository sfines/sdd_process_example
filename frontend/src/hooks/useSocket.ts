/**
 * Socket Hook
 *
 * Custom React hook that integrates Socket.IO with Zustand store.
 */

import { useEffect } from 'react';
import { socket } from '../services/socket.js';
import { useSocketStore } from '../store/socketStore.js';

export const useSocket = () => {
  const { setConnected, setConnectionMessage, setConnectionError, reset } =
    useSocketStore();

  useEffect(() => {
    // Handle connection
    const onConnect = () => {
      setConnected(true);
      setConnectionError(null);

      // Send hello_message to server
      socket.emit('hello_message', { message: 'Hello from client!' });
    };

    // Handle disconnection
    const onDisconnect = () => {
      setConnected(false);
      setConnectionMessage(null);
    };

    // Handle connection error
    const onConnectError = (error: Error) => {
      setConnectionError(error.message);
      setConnected(false);
    };

    // Handle world_message from server
    const onWorldMessage = (data: { message: string }) => {
      setConnectionMessage(`Connection established: ${data.message}`);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('world_message', onWorldMessage);

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('world_message', onWorldMessage);
      reset();
    };
  }, [setConnected, setConnectionMessage, setConnectionError, reset]);

  return useSocketStore();
};
