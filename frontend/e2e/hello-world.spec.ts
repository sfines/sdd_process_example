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
    // Skip this test when server is running (which it always is in our Docker setup)
    // This test would require stopping the backend service
    test.skip(true, 'Server is running - cannot test disconnected state');

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
