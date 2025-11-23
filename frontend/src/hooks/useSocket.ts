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
    setCurrentPlayerName,
    addRollToHistory,
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
      console.log('[useSocket] onRoomCreated received:', data);
      
      // CRITICAL: Find player name from the players array
      const currentPlayer = data.players.find(p => p.player_id === data.creator_player_id);
      const playerName = currentPlayer?.name || '';
      
      // CRITICAL: Call both setters in sequence (Zustand batches updates)
      setCurrentPlayerId(data.creator_player_id);
      if (playerName) {
        setCurrentPlayerName(playerName);
      }
      setRoomState({ ...data, roll_history: data.roll_history as any[] });

      console.log('[useSocket] After setState, currentPlayerId:', data.creator_player_id);
      console.log('[useSocket] Players:', data.players);

      // Navigate - RoomView will read from updated store
      if (navigate) {
        navigate(`/room/${data.room_code}`);
      }

      // Show success toast
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
      current_player_id?: string;
      players: { player_id: string; name: string; connected: boolean }[];
      roll_history: unknown[];
    }) => {
      // Use the current_player_id sent by backend, or fall back to socket.id
      const playerId = data.current_player_id || socket.id || '';
      if (playerId) {
        // CRITICAL: Set these BEFORE setRoomState so they get preserved
        setCurrentPlayerId(playerId);
        
        // CRITICAL: Set player name from the players array
        const currentPlayer = data.players.find(p => p.player_id === playerId);
        if (currentPlayer) {
          setCurrentPlayerName(currentPlayer.name);
        }
      }
      
      // Update store state (after setting currentPlayerId)
      setRoomState({ ...data, roll_history: data.roll_history as any[] });

      // Navigate after next frame
      requestAnimationFrame(() => {
        if (navigate) {
          navigate(`/room/${data.room_code}`);
        }
      });

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
      
      // Check if player already exists to avoid duplicates
      const playerExists = state.players.some(
        (p) => p.player_id === data.player_id,
      );

      if (!playerExists) {
        // CRITICAL: Only update players array, don't touch roomState or rollHistory
        useSocketStore.setState((currentState) => ({
          players: [
            ...currentState.players,
            { player_id: data.player_id, name: data.name, connected: true },
          ],
        }));
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

    // Handle roll_result from server
    const onRollResult = (data: {
      roll_id: string;
      player_id: string;
      player_name: string;
      formula: string;
      individual_results: number[];
      modifier: number;
      total: number;
      timestamp: string;
      dc_pass?: boolean | null;
    }) => {
      // Add roll to history in store
      addRollToHistory(data);

      // Show toast notification for the roll
      window.dispatchEvent(
        new CustomEvent('toast:show', {
          detail: {
            type: 'info',
            message: `${data.player_name} rolled ${data.formula}: ${data.total}`,
          },
        }),
      );
    };

    // Handle room_state response (for initial fetch only)
    const onRoomState = (data: {
      room_code: string;
      mode: string;
      creator_player_id: string;
      players: { player_id: string; name: string; connected: boolean }[];
      roll_history: unknown[];
    }) => {
      // Get current store state
      const currentState = useSocketStore.getState();

      // CRITICAL: Only update rollHistory if current store is empty
      // This prevents stale polling responses from overwriting fresh WebSocket events
      // After initial fetch, roll_result events are the source of truth
      const useCurrentRolls = currentState.rollHistory.length > 0;

      setRoomState({
        ...data,
        roll_history: useCurrentRolls
          ? currentState.rollHistory
          : (data.roll_history as any[]),
      });
    };

    // Handle create room request from store
    // const onCreateRoom = (event: Event) => {
    //   const customEvent = event as CustomEvent<{ playerName: string }>;
    //   socket.emit('create_room', { player_name: customEvent.detail.playerName });
    // };

    // Handle join room request from store
    // const onJoinRoom = (event: Event) => {
    //   const customEvent = event as CustomEvent<{ roomCode: string; playerName: string }>;
    //   socket.emit('join_room', {
    //     room_code: customEvent.detail.roomCode,
    //     player_name: customEvent.detail.playerName,
    //   });
    // };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('world_message', onWorldMessage);
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('player_joined', onPlayerJoined);
    socket.on('roll_result', onRollResult);
    socket.on('room_state', onRoomState);
    socket.on('error', onError);
    // window.addEventListener('socket:createRoom', onCreateRoom);
    // window.addEventListener('socket:joinRoom', onJoinRoom);

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('world_message', onWorldMessage);
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('player_joined', onPlayerJoined);
      socket.off('roll_result', onRollResult);
      socket.off('room_state', onRoomState);
      socket.off('error', onError);
      // window.removeEventListener('socket:createRoom', onCreateRoom);
      // window.removeEventListener('socket:joinRoom', onJoinRoom);
      reset();
    };
  }, [
    setConnected,
    setConnectionMessage,
    setConnectionError,
    setRoomState,
    setCurrentPlayerId,
    setCurrentPlayerName,
    addRollToHistory,
    reset,
    navigate,
  ]);

  return useSocketStore();
};
