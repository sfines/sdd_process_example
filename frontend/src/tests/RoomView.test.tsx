import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RoomView from '../pages/RoomView';

// Mock the socket store
vi.mock('../store/socketStore', () => ({
  default: vi.fn(() => ({
    roomCode: 'ALPHA-1234',
    roomMode: 'Open',
    players: [
      { player_id: '1', name: 'Alice', connected: true },
      { player_id: '2', name: 'Bob', connected: true },
    ],
    rollHistory: [],
  })),
}));

describe('RoomView', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoomView />} />
        </Routes>
      </BrowserRouter>,
    );

    expect(screen.getAllByText(/room/i)[0]).toBeInTheDocument();
  });

  it('displays room code prominently', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoomView />} />
        </Routes>
      </BrowserRouter>,
    );

    expect(screen.getByText('ALPHA-1234')).toBeInTheDocument();
  });

  it('shows player list section', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoomView />} />
        </Routes>
      </BrowserRouter>,
    );

    expect(screen.getByText(/players/i)).toBeInTheDocument();
  });

  it('shows roll history section', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoomView />} />
        </Routes>
      </BrowserRouter>,
    );

    expect(screen.getByText(/roll history|dice rolls/i)).toBeInTheDocument();
  });
});
