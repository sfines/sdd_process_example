/**
 * Connection Status Component
 *
 * Displays WebSocket connection state and received messages.
 */

import React from 'react';
import { useSocketStore } from '../store/socketStore';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionMessage, connectionError } = useSocketStore();

  return (
    <div className="connection-status">
      <h2>WebSocket Connection Status</h2>

      <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-indicator">●</span>
        <span className="status-text">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {connectionError && (
        <div className="error" role="alert">
          <strong>Error:</strong> {connectionError}
        </div>
      )}

      {connectionMessage && (
        <div className="message" role="status">
          {connectionMessage}
        </div>
      )}

      <style>{`
        .connection-status {
          padding: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .status.connected {
          background-color: #d4edda;
          color: #155724;
        }

        .status.disconnected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-indicator {
          font-size: 1.5rem;
        }

        .status.connected .status-indicator {
          color: #28a745;
        }

        .status.disconnected .status-indicator {
          color: #dc3545;
        }

        .error {
          padding: 1rem;
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .message {
          padding: 1rem;
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
          border-radius: 8px;
          margin: 1rem 0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
