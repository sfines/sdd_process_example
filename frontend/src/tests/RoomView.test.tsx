import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RoomView from '../pages/RoomView';

// Mock the socket store
vi.mock('../store/socketStore', () => ({
  __esModule: true,
  useSocketStore: vi.fn((fn) => {
    const state = {
      roomCode: 'ALPHA-1234',
      roomMode: 'Open',
      creatorPlayerId: '1',
      players: [
        { player_id: '1', name: 'Alice', connected: true },
        { player_id: '2', name: 'Bob', connected: true },
      ],
      rollHistory: [],
      currentPlayerId: '1',
      rollDice: vi.fn(),
    };
    return fn(state);
  }),
}));

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/room/ALPHA-1234']}>
      <Routes>
        <Route path="/room/:roomCode" element={<RoomView />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('RoomView', () => {
  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText(/Game Room/i)).toBeInTheDocument();
  });

  it('displays room code prominently', () => {
    renderComponent();
    expect(screen.getByText('ALPHA-1234')).toBeInTheDocument();
  });

  it('shows player list section', () => {
    renderComponent();
    expect(screen.getByText(/players/i)).toBeInTheDocument();
  });

  it('shows roll history section', () => {
    renderComponent();
    expect(screen.getByText(/roll history|dice rolls/i)).toBeInTheDocument();
  });
});
