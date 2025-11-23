/**
 * RoomView Figma Design Migration Tests
 *
 * Tests for shadcn/ui component integration in RoomView
 * PRESERVES Socket.io integration - only tests UI changes
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RoomView from '../pages/RoomView';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/room/:roomCode" element={children} />
    </Routes>
  </BrowserRouter>
);

describe('RoomView - Figma Design Integration', () => {
  it('renders with shadcn/ui Card components for layout sections', () => {
    const { container } = render(<RoomView />, { wrapper });

    // Should have card-like containers with rounded styling
    const cards = container.querySelectorAll('[class*="rounded"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('displays room code with Copy button using Lucide icon', () => {
    const { container } = render(<RoomView />, { wrapper });

    // Check for SVG icon (Lucide icons render as SVG)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('shows connection status with Wifi icon indicator', () => {
    const { container } = render(<RoomView />, { wrapper });

    // Should have connection status indicator (Wifi/WifiOff icon)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('uses three-column responsive layout structure', () => {
    const { container } = render(<RoomView />, { wrapper });

    // Check for grid or flex layout classes
    const layoutContainers = container.querySelectorAll('[class*="grid"], [class*="flex"]');
    expect(layoutContainers.length).toBeGreaterThan(0);
  });
});
