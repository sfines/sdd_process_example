/**
 * E2E Test: WebSocket Hello World Connection
 *
 * Prerequisites:
 * - Backend server running on http://localhost:8000
 * - Frontend server running on http://localhost (Docker) or http://localhost:5173 (dev)
 */

import { test, expect } from '@playwright/test';

test.describe('WebSocket Hello World Connection', () => {
  test('should establish connection and receive world_message', async ({
    page,
  }) => {
    // Navigate to application
    await page.goto('/');

    // Wait for title
    await expect(page.locator('h1')).toContainText('D&D Dice Roller');

    // Wait for connection status to show "Connected"
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

    // Verify world_message received from server
    await expect(
      page.getByText('Connection established: World from server!'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('should display disconnected state when server is unavailable', async ({
    page,
  }) => {
    // This test assumes the server is NOT running
    // Skip in environments where server is always available
    test.skip(
      process.env.DOCKER_ENV === 'true',
      'Server always running in Docker',
    );

    await page.goto('/');

    // Should show disconnected state
    await expect(page.getByText('Disconnected')).toBeVisible({
      timeout: 10000,
    });

    // May show connection error
    const errorText = page.getByText(/Error:/);
    if (await errorText.isVisible()) {
      expect(await errorText.textContent()).toContain('Error:');
    }
  });
});
