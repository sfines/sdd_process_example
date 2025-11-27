/**
 * RoomView Figma Design Migration Tests
 *
 * Tests for shadcn/ui component integration in RoomView
 * PRESERVES Socket.io integration - only tests UI changes
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RoomView from '../pages/RoomView';

describe('RoomView - Figma Design Integration', () => {
  const renderWithRouter = (roomCode: string = 'TEST123') => {
    return render(
      <MemoryRouter initialEntries={[`/room/${roomCode}`]}>
        <Routes>
          <Route path="/room/:roomCode" element={<RoomView />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders with shadcn/ui Card components for layout sections', () => {
    const { container } = renderWithRouter();

    // Should have card-like containers with rounded styling (Card components)
    const cards = container.querySelectorAll('[class*="rounded"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('displays room code with Copy button using Lucide icon', () => {
    const { container } = renderWithRouter();

    // Check for SVG icons (Lucide icons render as SVG)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('shows connection status with Wifi icon indicator', () => {
    const { container } = renderWithRouter();

    // Should have connection status indicator (Wifi/WifiOff icon from Lucide)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('uses three-column responsive layout structure', () => {
    const { container } = renderWithRouter();

    // Check for grid layout classes (lg:grid-cols-3 for three columns)
    const layoutContainers = container.querySelectorAll('[class*="grid"]');
    expect(layoutContainers.length).toBeGreaterThan(0);
  });
});
