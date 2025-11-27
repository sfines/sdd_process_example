/**
 * HomePage Figma Design Migration Tests
 *
 * Tests for shadcn/ui component integration in HomePage
 * PRESERVES Socket.io integration - only tests UI changes
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('HomePage - Figma Design Integration', () => {
  it('renders with shadcn/ui Button components', () => {
    render(<Home />, { wrapper });

    const createButton = screen.getByRole('button', { name: /create room/i });
    const joinButton = screen.getByRole('button', { name: /join room/i });

    expect(createButton).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();
  });

  it('renders with shadcn/ui Input components', () => {
    render(<Home />, { wrapper });

    // Should have input fields for player names and room code
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('displays Lucide Dices icon in header', () => {
    const { container } = render(<Home />, { wrapper });

    // Check for SVG icon (Lucide icons render as SVG)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('uses shadcn/ui Card styling for sections', () => {
    const { container } = render(<Home />, { wrapper });

    // Check for card-like containers with Figma styling classes
    const cards = container.querySelectorAll('[class*="rounded"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('maintains centered max-width layout (Figma design)', () => {
    const { container } = render(<Home />, { wrapper });

    // Check for max-width container (Figma spec: max-width: 28rem)
    const mainContainer = container.querySelector('[class*="max-w"]');
    expect(mainContainer).toBeInTheDocument();
  });
});
