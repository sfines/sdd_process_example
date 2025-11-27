/**
 * usePing Hook
 *
 * Manages ping/pong heartbeat for connection health monitoring.
 * Sends periodic ping events to server to maintain connection status.
 */

import { useEffect, useRef, useCallback } from 'react';
import { socket } from '../services/socket';

// Default ping interval: 30 seconds
const DEFAULT_PING_INTERVAL = 30000;

interface UsePingOptions {
  interval?: number;
  enabled?: boolean;
}

interface UsePingResult {
  startPinging: () => void;
  stopPinging: () => void;
  isActive: boolean;
}

export function usePing(options: UsePingOptions = {}): UsePingResult {
  const { interval = DEFAULT_PING_INTERVAL, enabled = true } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  const sendPing = useCallback(() => {
    if (socket.connected) {
      socket.emit('ping', {});
    }
  }, []);

  const startPinging = useCallback(() => {
    if (intervalRef.current) {
      return; // Already pinging
    }

    isActiveRef.current = true;

    // Send initial ping
    sendPing();

    // Set up interval
    intervalRef.current = setInterval(sendPing, interval);
  }, [interval, sendPing]);

  const stopPinging = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isActiveRef.current = false;
  }, []);

  // Auto-start pinging when enabled and socket connects
  useEffect(() => {
    if (!enabled) {
      stopPinging();
      return;
    }

    const handleConnect = () => {
      startPinging();
    };

    const handleDisconnect = () => {
      stopPinging();
    };

    // If already connected, start pinging
    if (socket.connected) {
      startPinging();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      stopPinging();
    };
  }, [enabled, startPinging, stopPinging]);

  // Listen for pong responses (optional debug logging)
  useEffect(() => {
    const handlePong = () => {
      // Pong received - connection is healthy
      // Could add debug logging here if needed
    };

    socket.on('pong', handlePong);

    return () => {
      socket.off('pong', handlePong);
    };
  }, []);

  return {
    startPinging,
    stopPinging,
    isActive: isActiveRef.current,
  };
}

export default usePing;
