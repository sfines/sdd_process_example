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
    setCurrentPlayerId,
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
      setCurrentPlayerId(data.creator_player_id); // Current user is the creator
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

    // Handle room_joined from server
    const onRoomJoined = (data: {
      room_code: string;
      mode: string;
      creator_player_id: string;
      players: { player_id: string; name: string; connected: boolean }[];
      roll_history: unknown[];
    }) => {
      setRoomState(data);
      // Current user is the socket.id which matches a player_id in the players array
      if (socket.id) {
        setCurrentPlayerId(socket.id);
      }
      if (navigate) {
        navigate(`/room/${data.room_code}`);
      }
      // Show success toast
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: {
            type: 'success',
            message: `Successfully joined room ${data.room_code}`,
          },
        }),
      );
    };

    // Handle player_joined broadcast from server
    const onPlayerJoined = (data: { player_id: string; name: string }) => {
      // Get current store state
      const state = useSocketStore.getState();
      if (state.roomState) {
        const updatedRoomState = {
          ...state.roomState,
          players: [
            ...state.roomState.players,
            { player_id: data.player_id, name: data.name, connected: true },
          ],
        };
        setRoomState(updatedRoomState);
      }
      // Show info toast
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: {
            type: 'info',
            message: `${data.name} joined the room`,
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

    // Handle join room request from store
    const onJoinRoom = (event: Event) => {
      const customEvent = event as CustomEvent<{ roomCode: string; playerName: string }>;
      socket.emit('join_room', {
        room_code: customEvent.detail.roomCode,
        player_name: customEvent.detail.playerName,
      });
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('world_message', onWorldMessage);
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('player_joined', onPlayerJoined);
    socket.on('error', onError);
    window.addEventListener('socket:createRoom', onCreateRoom);
    window.addEventListener('socket:joinRoom', onJoinRoom);

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('world_message', onWorldMessage);
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('player_joined', onPlayerJoined);
      socket.off('error', onError);
      window.removeEventListener('socket:createRoom', onCreateRoom);
      window.removeEventListener('socket:joinRoom', onJoinRoom);
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
