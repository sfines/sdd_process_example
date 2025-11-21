/**
 * Socket Hook
 *
 * Custom React hook that integrates Socket.IO with Zustand store.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket.js';
import { useSocketStore } from '../store/socketStore.js';

export const useSocket = () => {
  const {
    setConnected,
    setConnectionMessage,
    setConnectionError,
    setRoomState,
    reset,
  } = useSocketStore();
  
  // Make navigate optional to support tests without Router
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Not in Router context, that's okay for some tests
  }

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

    // Handle room_created from server
    const onRoomCreated = (data: {
      room_code: string;
      mode: string;
      creator_player_id: string;
      players: { player_id: string; name: string; connected: boolean }[];
      roll_history: unknown[];
    }) => {
      setRoomState(data);
      if (navigate) {
        navigate(`/room/${data.room_code}`);
      }
      // Show success toast (handled by toast system)
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: {
            type: 'success',
            message: `Room created! Share code ${data.room_code}`,
          },
        }),
      );
    };

    // Handle error from server
    const onError = (data: { message: string }) => {
      setConnectionError(data.message);
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: {
            type: 'error',
            message: data.message,
          },
        }),
      );
    };

    // Handle create room request from store
    const onCreateRoom = (event: Event) => {
      const customEvent = event as CustomEvent<{ playerName: string }>;
      socket.emit('create_room', { player_name: customEvent.detail.playerName });
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('world_message', onWorldMessage);
    socket.on('room_created', onRoomCreated);
    socket.on('error', onError);
    window.addEventListener('socket:createRoom', onCreateRoom);

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('world_message', onWorldMessage);
      socket.off('room_created', onRoomCreated);
      socket.off('error', onError);
      window.removeEventListener('socket:createRoom', onCreateRoom);
      reset();
    };
  }, [
    setConnected,
    setConnectionMessage,
    setConnectionError,
    setRoomState,
    reset,
  ]);

  return useSocketStore();
};
