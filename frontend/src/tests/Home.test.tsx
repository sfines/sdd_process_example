import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

// Mock the socket store
vi.mock('../store/socketStore', () => ({
  default: vi.fn(() => ({
    createRoom: vi.fn(),
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

    expect(screen.getByText(/create.*room/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create room/i })).toBeInTheDocument();
  });

  it('has a name input field with max length 20', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/enter your name/i) as HTMLInputElement;
    expect(input).toHaveAttribute('maxLength', '20');
  });

  it('create room button has minimum 44px height for tap target', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /create room/i });
    const styles = window.getComputedStyle(button);
    const height = parseInt(styles.height);

    expect(height).toBeGreaterThanOrEqual(44);
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

    const input = screen.getByPlaceholderText(/enter your name/i);
    const button = screen.getByRole('button', { name: /create room/i });

    fireEvent.change(input, { target: { value: 'Alice' } });

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
});
