/**
 * E2E Test: Debugging Socket.IO event emissions
 */

import { test, expect } from '@playwright/test';

test.describe('Socket.IO Emission Debugging', () => {
  test('should create a room by directly evaluating socket.emit', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

    // Wait for the socket object to be attached to the window
    await page.waitForFunction(() => (window as any).socket, {
      timeout: 5000,
    });

    // Use page.evaluate to directly trigger the socket event
    // This bypasses the UI and calls the function in the browser's context
    await page.evaluate(() => {
      // @ts-expect-error - socket is global and we've waited for it
      window.socket.emit('create_room', { player_name: 'Debugger' });
    });

    // The test will pass if it doesn't crash.
    // We need to check backend logs manually to confirm event receipt.
    console.log(
      'Fired create_room event via page.evaluate. Check backend logs.',
    );

    // Add a small delay to allow backend to process
    await page.waitForTimeout(3000);

    // As a proxy for success, we can check if the client navigated,
    // which happens on the 'room_created' response.
    await expect(page).toHaveURL(/\/room\/.+/, { timeout: 5000 });
  });
});
