/**
 * E2E Test: Join an Existing Room (Story 2.2)
 *
 * Prerequisites:
 * - Backend server running on http://localhost:8000
 * - Frontend server running on http://localhost
 * - Redis running and accessible
 *
 * Tests the complete multi-player room join flow:
 * 1. Player 1 creates a room
 * 2. Player 2 joins using room code
 * 3. Both players see each other in player list
 * 4. Real-time sync via player_joined event
 */

import { test, expect, type BrowserContext } from '@playwright/test';

test.describe('Story 2.2: Join an Existing Room', () => {
  test('AC1+AC2: User can join room with valid room code and player name', async ({
    browser,
  }) => {
    // Create two browser contexts (two separate users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Player 1: Navigate and create room
      await page1.goto('/');
      await expect(page1.getByText('Connected')).toBeVisible({
        timeout: 10000,
      });

      // Fill in create room form
      await page1.getByLabel('Your Name').first().fill('Alice');
      await page1.getByRole('button', { name: /create room/i }).click();

      // Wait for room creation and navigation
      await page1.waitForURL(/\/room\/.+/, { timeout: 5000 });
      await expect(page1.getByText('Game Room')).toBeVisible();

      // Extract room code from the room code display element
      const roomCodeElement = page1.getByTestId('room-code');
      await expect(roomCodeElement).toBeVisible({ timeout: 3000 });
      const roomCode = (await roomCodeElement.textContent()) || '';
      expect(roomCode).toMatch(/[A-Z]+-[0-9]{4}/);

      console.log(`Room created: ${roomCode}`);

      // Player 2: Navigate to home page
      await page2.goto('/');
      await expect(page2.getByText('Connected')).toBeVisible({
        timeout: 10000,
      });

      // Fill join room form
      await page2.getByLabel('Room Code').fill(roomCode);
      await page2.getByLabel('Your Name').nth(1).fill('Bob');

      // Click Join button
      await page2.getByRole('button', { name: /join/i }).click();

      // Wait for navigation to room view
      await page2.waitForURL(new RegExp(`/room/${roomCode}`), {
        timeout: 5000,
      });
      await expect(page2.getByText('Game Room')).toBeVisible();

      // AC2: Successfully joined - verify room code displayed in the display element
      await expect(page2.getByTestId('room-code')).toHaveText(roomCode);

      // AC5: Both players should see player list
      await expect(page2.getByText('Players')).toBeVisible();
      await expect(page2.getByTestId('player-Alice')).toBeVisible({ timeout: 3000 });
      await expect(page2.getByTestId('player-Bob')).toBeVisible();

      // AC6: Player 1 should receive player_joined event and see Player 2
      await expect(page1.getByTestId('player-Bob')).toBeVisible({ timeout: 5000 });

      // Verify both players shown on both pages
      await expect(page1.getByTestId('player-Alice')).toBeVisible();
      await expect(page2.getByTestId('player-Alice')).toBeVisible();
      await expect(page1.getByTestId('player-Bob')).toBeVisible();
      await expect(page2.getByTestId('player-Bob')).toBeVisible();
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('AC3: Room code validation - invalid room code shows error', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

    // Wait a moment to ensure socket event handlers are registered
    await page.waitForTimeout(1000);

    // Try to join non-existent room
    await page.getByLabel('Room Code').fill('INVALID-9999');
    await page.getByLabel('Your Name').nth(1).fill('Charlie');

    await page.getByRole('button', { name: /join/i }).click();

    // Wait a moment for the request to complete
    await page.waitForTimeout(3000);

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/invalid-room-code.png' });

    // Should show error toast (room not found)
    // The error event should trigger a toast with the message
    const errorToast = page.locator('role=alert').first();
    await expect(errorToast).toBeVisible({ timeout: 10000 });
    await expect(errorToast).toContainText(/not found/i);

    // Should NOT navigate to room view
    await expect(page).toHaveURL('/', { timeout: 2000 });
  });

  test('AC10: Player connection status displayed correctly', async ({
    browser,
  }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Create room
      await page1.goto('/');
      await expect(page1.getByText('Connected')).toBeVisible({
        timeout: 10000,
      });
      await page1.getByLabel('Your Name').first().fill('Alice');
      await page1.getByRole('button', { name: /create room/i }).click();
      await page1.waitForURL(/\/room\/.+/, { timeout: 5000 });

      const roomCodeElement = page1.getByTestId('room-code');
      const roomCode = (await roomCodeElement.textContent()) || '';

      // Join room
      await page2.goto('/');
      await expect(page2.getByText('Connected')).toBeVisible({
        timeout: 10000,
      });
      await page2.getByLabel('Room Code').fill(roomCode);
      await page2.getByLabel('Your Name').nth(1).fill('Bob');
      await page2.getByRole('button', { name: /join/i }).click();
      await page2.waitForURL(new RegExp(`/room/${roomCode}`), {
        timeout: 5000,
      });

      // Both players should have green connection indicator (connected: true)
      // Look for green circle indicators (bg-green-500 in PlayerList component)
      // Scope to player list items to avoid matching other green elements
      const greenIndicators1 = page1.locator('[role="list"] .bg-green-500');
      const greenIndicators2 = page2.locator('[role="list"] .bg-green-500');

      // Should have at least 2 green indicators (both players connected)
      await expect(greenIndicators1).toHaveCount(2, { timeout: 5000 });
      await expect(greenIndicators2).toHaveCount(2, { timeout: 5000 });

      // Verify current player sees "(You)" label
      await expect(page1.getByText('(You)')).toBeVisible();
      await expect(page2.getByText('(You)')).toBeVisible();
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('AC7: Roll history loaded for joining player', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Create room
      await page1.goto('/');
      await expect(page1.getByText('Connected')).toBeVisible({
        timeout: 10000,
      });
      await page1.getByLabel('Your Name').first().fill('Alice');
      await page1.getByRole('button', { name: /create room/i }).click();
      await page1.waitForURL(/\/room\/.+/, { timeout: 5000 });

      const roomCodeElement = page1.getByTestId('room-code');
      const roomCode = (await roomCodeElement.textContent()) || '';

      // Join room
      await page2.goto('/');
      await expect(page2.getByText('Connected')).toBeVisible({
        timeout: 10000,
      });
      await page2.getByLabel('Room Code').fill(roomCode);
      await page2.getByLabel('Your Name').nth(1).fill('Bob');
      await page2.getByRole('button', { name: /join/i }).click();
      await page2.waitForURL(new RegExp(`/room/${roomCode}`), {
        timeout: 5000,
      });

      // Verify Roll History section visible
      await expect(page2.getByText('Roll History')).toBeVisible();
      // Empty state message should show
      await expect(
        page2.getByText(/no rolls yet|roll some dice/i),
      ).toBeVisible();
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('Edge case: Multiple players joining simultaneously', async ({
    browser,
  }) => {
    const contexts: BrowserContext[] = [];

    try {
      // Create 4 browser contexts
      for (let i = 0; i < 4; i++) {
        const context = await browser.newContext();
        contexts.push(context);
      }

      const pages = await Promise.all(contexts.map((c) => c.newPage()));

      // Player 1: Create room
      await pages[0].goto('/');
      await expect(pages[0].getByText('Connected')).toBeVisible({
        timeout: 10000,
      });
      await pages[0].getByLabel('Your Name').first().fill('Player1');
      await pages[0].getByRole('button', { name: /create room/i }).click();
      await pages[0].waitForURL(/\/room\/.+/, { timeout: 5000 });

      const roomCodeElement = pages[0].getByTestId('room-code');
      const roomCode = (await roomCodeElement.textContent()) || '';

      // Players 2-4: Join simultaneously
      await Promise.all(
        pages.slice(1).map(async (page, index) => {
          await page.goto('/');
          await expect(page.getByText('Connected')).toBeVisible({
            timeout: 10000,
          });
          await page.getByLabel('Room Code').fill(roomCode);
          await page
            .getByLabel('Your Name')
            .nth(1)
            .fill(`Player${index + 2}`);
          await page.getByRole('button', { name: /join/i }).click();
          await page.waitForURL(new RegExp(`/room/${roomCode}`), {
            timeout: 5000,
          });
        }),
      );

      // All pages should show 4 players
      for (const page of pages) {
        await expect(page.getByText(/Players/)).toBeVisible({
          timeout: 5000,
        });
        await expect(page.getByTestId('player-Player1')).toBeVisible();
        await expect(page.getByTestId('player-Player2')).toBeVisible();
        await expect(page.getByTestId('player-Player3')).toBeVisible();
        await expect(page.getByTestId('player-Player4')).toBeVisible();
      }
    } finally {
      for (const context of contexts) {
        await context.close();
      }
    }
  });
});
