/**
 * Unit tests for ConnectionStatus component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from '../components/ConnectionStatus.js';
import { useSocketStore } from '../store/socketStore.js';

describe('ConnectionStatus', () => {
  beforeEach(() => {
    // Reset store before each test
    useSocketStore.getState().reset();
  });

  it('displays disconnected state by default', () => {
    render(<ConnectionStatus />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('displays connected state when socket is connected', () => {
    useSocketStore.getState().setConnected(true);
    render(<ConnectionStatus />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('displays connection message when received', () => {
    useSocketStore.getState().setConnected(true);
    useSocketStore
      .getState()
      .setConnectionMessage('Connection established: World from server!');
    render(<ConnectionStatus />);
    expect(
      screen.getByText('Connection established: World from server!'),
    ).toBeInTheDocument();
  });

  it('displays error message when connection fails', () => {
    useSocketStore.getState().setConnectionError('Connection refused');
    render(<ConnectionStatus />);
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument();
  });
});
