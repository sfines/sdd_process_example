/**
 * E2E Test: Basic Dice Roll (Story 2.3)
 *
 * Tests the complete dice rolling flow from UI to backend and back.
 */

import { test, expect } from '@playwright/test';

test.describe('Basic Dice Roll (1d20)', () => {
  test('should create room, roll dice, and see result in history', async ({
    page,
  }) => {
    // Navigate to home page
    await page.goto('/');

    // Wait for socket connection
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

    // Create a room
    const playerName = `Player${Math.floor(Math.random() * 10000)}`;
    await page.getByLabel('Your Name').first().fill(playerName);
    await page.getByRole('button', { name: /create room/i }).click();

    // Wait for room creation and navigation
    await page.waitForURL(/\/room\/.+/, { timeout: 5000 });

    // Wait for room content to render (Game Room heading)
    await expect(page.getByText('Game Room')).toBeVisible({ timeout: 10000 });

    // Wait for player to appear (socket event is async, may take a moment)
    await expect(page.getByTestId(`player-${playerName}`)).toBeVisible({
      timeout: 10000,
    });

    // Find the dice input field
    const diceInput = page.getByPlaceholder('1d20+5');
    await expect(diceInput).toBeVisible();

    // Enter dice formula
    await diceInput.fill('1d20+5');

    // Click Roll button
    await page.getByRole('button', { name: /roll/i }).click();

    // Wait for roll to complete (button should briefly show "Rolling...")
    await page.waitForTimeout(500);

    // Verify input was cleared
    await expect(diceInput).toHaveValue('');

    // Verify roll appears in roll history
    // Should see player name, formula, and total
    const rollHistorySection = page
      .locator('div')
      .filter({ hasText: /^Roll History/ })
      .first();
    await expect(rollHistorySection.getByText(playerName)).toBeVisible();
    await expect(rollHistorySection.locator('text=/1d20\\+5/i')).toBeVisible();

    // Verify total is within valid range (6-25 for 1d20+5)
    const totalRegex = /\b([6-9]|1[0-9]|2[0-5])\b/; // 6-25
    // Use .first() to select first matching element (avoids strict mode violation)
    await expect(
      rollHistorySection.locator('text=' + totalRegex).first(),
    ).toBeVisible();
  });

  test('should show multiple rolls in history', async ({ page }) => {
    // Create room
    await page.goto('/');
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

    const playerName = `Player${Math.floor(Math.random() * 10000)}`;
    await page.getByLabel('Your Name').first().fill(playerName);
    await page.getByRole('button', { name: /create room/i }).click();
    await page.waitForURL(/\/room\/.+/, { timeout: 5000 });
    await expect(page.getByText('Game Room')).toBeVisible();

    // Roll three times
    for (let i = 0; i < 3; i++) {
      const diceInput = page.getByPlaceholder('1d20+5');
      await diceInput.fill('1d20');
      await page.getByRole('button', { name: /roll/i }).click();
      await page.waitForTimeout(500);
    }

    // Verify three rolls appear in history
    const rollHistoryItems = page
      .locator('ul[role="list"]')
      .first()
      .locator('li');
    const count = await rollHistoryItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should handle negative modifier correctly', async ({ page }) => {
    // Create room
    await page.goto('/');
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

    const playerName = `Player${Math.floor(Math.random() * 10000)}`;
    await page.getByLabel('Your Name').first().fill(playerName);
    await page.getByRole('button', { name: /create room/i }).click();
    await page.waitForURL(/\/room\/.+/, { timeout: 5000 });
    await expect(page.getByText('Game Room')).toBeVisible();

    // Roll with negative modifier
    const diceInput = page.getByPlaceholder('1d20+5');
    await diceInput.fill('1d20-2');
    await page.getByRole('button', { name: /roll/i }).click();
    await page.waitForTimeout(500);

    // Verify formula with negative modifier appears
    await expect(page.locator('text=/1d20-2/i').first()).toBeVisible();

    // Verify total is within valid range (-1 to 18 for 1d20-2)
    // Just check that a number appears - specific range validation is in backend tests
    const rollHistorySection = page.locator('text=Roll History').locator('..');
    const totalElement = rollHistorySection
      .locator('div[class*="blue"]')
      .first();
    await expect(totalElement).toBeVisible();
  });

  test('should not allow invalid dice formula', async ({ page }) => {
    // Create room
    await page.goto('/');
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

    const playerName = `Player${Math.floor(Math.random() * 10000)}`;
    await page.getByLabel('Your Name').first().fill(playerName);
    await page.getByRole('button', { name: /create room/i }).click();
    await page.waitForURL(/\/room\/.+/, { timeout: 5000 });
    await expect(page.getByText('Game Room')).toBeVisible();

    // Try to roll with invalid formula
    const diceInput = page.getByPlaceholder('1d20+5');
    await diceInput.fill('invalid');

    // Roll button should be disabled or click should do nothing
    const rollButton = page.getByRole('button', { name: /roll/i });
    const isDisabled = await rollButton.isDisabled();

    if (!isDisabled) {
      await rollButton.click();
      await page.waitForTimeout(500);

      // Verify no roll appeared in history (should still show "No rolls yet")
      const noRollsText = page.locator('text=/no rolls yet/i');
      await expect(noRollsText).toBeVisible();
    }
  });

  test('should show timestamp for each roll', async ({ page }) => {
    // Create room and roll
    await page.goto('/');
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

    const playerName = `Player${Math.floor(Math.random() * 10000)}`;
    await page.getByLabel('Your Name').first().fill(playerName);
    await page.getByRole('button', { name: /create room/i }).click();
    await page.waitForURL(/\/room\/.+/, { timeout: 5000 });
    await expect(page.getByText('Game Room')).toBeVisible();

    const diceInput = page.getByPlaceholder('1d20+5');
    await diceInput.fill('1d20');
    await page.getByRole('button', { name: /roll/i }).click();
    await page.waitForTimeout(500);

    // Verify timestamp element exists (time tag)
    const timeElement = page.locator('time[role="time"]').first();
    await expect(timeElement).toBeVisible();

    // Timestamp should be in format HH:MM:SS
    const timeText = await timeElement.textContent();
    expect(timeText).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  test('should broadcast rolls to all players in room', async ({ browser }) => {
    // Create two browser contexts (two players)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Player 1: Create room
      await page1.goto('/');
      await expect(page1.getByText('Connected')).toBeVisible({
        timeout: 10000,
      });

      const player1Name = `Alice${Math.floor(Math.random() * 10000)}`;
      await page1.getByLabel('Your Name').first().fill(player1Name);
      await page1.getByRole('button', { name: /create room/i }).click();
      await page1.waitForURL(/\/room\/.+/, { timeout: 5000 });
      await expect(page1.getByText('Game Room')).toBeVisible();

      // Get room code
      const roomCodeElement = page1.getByTestId('room-code');
      await expect(roomCodeElement).toBeVisible({ timeout: 3000 });
      const roomCode = await roomCodeElement.textContent();
      expect(roomCode).toMatch(/[A-Z]+-[0-9]{4}/);

      // Player 2: Navigate and join room
      await page2.goto('/');
      await expect(page2.getByText('Connected')).toBeVisible({
        timeout: 10000,
      });

      const player2Name = `Bob${Math.floor(Math.random() * 10000)}`;

      // Fill join room form (both forms visible on home page)
      await page2.getByLabel('Room Code').fill(roomCode!);
      await page2.getByLabel('Your Name').nth(1).fill(player2Name);
      await page2.getByRole('button', { name: /join/i }).click();

      await page2.waitForURL(/\/room\/.+/, { timeout: 5000 });
      await expect(page2.getByText('Game Room')).toBeVisible();

      // Wait for both players to appear (socket events are async, may take a moment)
      await expect(page2.getByTestId(`player-${player1Name}`)).toBeVisible({
        timeout: 10000,
      });
      await expect(page2.getByTestId(`player-${player2Name}`)).toBeVisible({
        timeout: 10000,
      });

      // Player 1 should also see both players
      await expect(page1.getByTestId(`player-${player1Name}`)).toBeVisible({
        timeout: 10000,
      });
      await expect(page1.getByTestId(`player-${player2Name}`)).toBeVisible({
        timeout: 5000,
      });

      // Player 1: Roll dice
      const diceInput1 = page1.getByPlaceholder('1d20+5');
      await diceInput1.fill('1d20+3');
      await page1.getByRole('button', { name: /roll/i }).click();
      await page1.waitForTimeout(1000);

      // Player 2: Should see the roll
      await expect(page2.getByText(player1Name).nth(1)).toBeVisible(); // In roll history
      // Use .first() to select first matching element (avoids strict mode violation)
      await expect(page2.locator('text=/1d20\\+3/i').first()).toBeVisible();

      // Player 2: Roll dice
      const diceInput2 = page2.getByPlaceholder('1d20+5');
      await diceInput2.fill('1d20-1');
      await page2.getByRole('button', { name: /roll/i }).click();
      await page2.waitForTimeout(1000);

      // Player 1: Should see both rolls
      await expect(page1.locator('text=/1d20\\+3/i')).toBeVisible();
      await expect(page1.locator('text=/1d20-1/i')).toBeVisible();
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
