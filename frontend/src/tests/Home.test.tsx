import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

// Mock the socket store
vi.mock('../store/socketStore', () => ({
  useSocketStore: vi.fn(() => ({
    createRoom: vi.fn(),
    joinRoom: vi.fn(),
    connectionError: null,
  })),
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the home page with create room form', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/create.*room/i)[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/enter your name/i)).toHaveLength(2);
    expect(screen.getByRole('button', { name: /create room/i })).toBeInTheDocument();
  });

  it('has a name input field with max length 20', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const inputs = screen.getAllByPlaceholderText(/enter your name/i) as HTMLInputElement[];
    inputs.forEach(input => {
      expect(input).toHaveAttribute('maxLength', '20');
    });
  });

  it('create room button has minimum 44px height for tap target', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /create room/i });
    const minHeight = button.style.minHeight;

    expect(minHeight).toBe('48px');
  });

  it('validates empty player name', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /create room/i });
    fireEvent.click(button);

    // Should show validation error or not call createRoom
    await waitFor(() => {
      // Button should be disabled or show error
      expect(button).toBeDisabled();
    });
  });

  it('enables button when name is entered', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const nameInputs = screen.getAllByPlaceholderText(/enter your name/i);
    const createNameInput = nameInputs[0]; // First input is for create
    const button = screen.getByRole('button', { name: /create room/i });

    fireEvent.change(createNameInput, { target: { value: 'Alice' } });

    expect(button).not.toBeDisabled();
  });

  it('shows join room section as placeholder', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Should have some indication of join room (deferred to Story 2.2)
    expect(screen.getByText(/join.*room/i)).toBeInTheDocument();
  });

  // Story 2.2 tests - Join Room functionality
  it('renders join room form with room code and name inputs', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/e\.g\., ALPHA-1234/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/enter your name/i)).toHaveLength(2);
    expect(screen.getByRole('button', { name: /^join$/i })).toBeInTheDocument();
  });

  it('room code input has max length for WORD-#### format', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/e\.g\., ALPHA-1234/i) as HTMLInputElement;
    expect(input).toHaveAttribute('maxLength', '20');
  });

  it('join button is disabled when room code or name is empty', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const joinButton = screen.getByRole('button', { name: /^join$/i });
    expect(joinButton).toBeDisabled();
  });

  it('join button is enabled when both inputs are filled', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const roomCodeInput = screen.getByPlaceholderText(/e\.g\., ALPHA-1234/i);
    const nameInputs = screen.getAllByPlaceholderText(/enter your name/i);
    const joinNameInput = nameInputs[1];
    const joinButton = screen.getByRole('button', { name: /^join$/i });

    fireEvent.change(roomCodeInput, { target: { value: 'ALPHA-1234' } });
    fireEvent.change(joinNameInput, { target: { value: 'Bob' } });

    expect(joinButton).not.toBeDisabled();
  });
});
