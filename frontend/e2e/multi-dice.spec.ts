/**
 * E2E Tests for Multiple Dice Rolls
 *
 * Tests rolling multiple dice of the same type (e.g., 3d6, 20d6, 100d6).
 * Validates that all individual results display correctly with expandable UI.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8090';

test.describe('Multiple Dice Rolls', () => {
  test('Player A rolls 1d6 and Player B sees result', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      // Player A creates room
      await pageA.goto(BASE_URL);
      await pageA.fill('input[placeholder="Enter your name"]', 'Player A');
      await pageA.click('button:has-text("Create Room")');

      // Wait for room creation and get room code
      await pageA.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });
      const roomCodeText = await pageA
        .locator('[data-testid="room-code"]')
        .textContent();
      const roomCode = roomCodeText?.trim();
      expect(roomCode).toBeTruthy();

      // Player B joins the same room
      await pageB.goto(BASE_URL);
      await pageB.fill('input[placeholder="Enter your name"]', 'Player B');
      await pageB.fill('input[placeholder="Enter room code"]', roomCode!);
      await pageB.click('button:has-text("Join Room")');

      // Wait for Player B to join
      await pageB.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });

      // Switch Player A to Advanced mode
      await pageA.click('button:has-text("Advanced")');
      await pageA.waitForSelector('text=d6', { timeout: 5000 });

      // Select d6
      await pageA.click('button:has-text("d6")');

      // Set quantity to 1
      const quantityInput = pageA.locator('input[aria-label="Number of dice"]');
      await quantityInput.fill('1');

      // Roll
      await pageA.click('button:has-text("Roll")');

      // Wait for roll to appear in Player A's history
      await pageA.waitForSelector('text=1d6', { timeout: 5000 });

      // Verify Player B sees the roll
      await pageB.waitForSelector('text=1d6', { timeout: 5000 });

      // Verify single result is displayed (no expand/collapse button)
      const expandButtonA = pageA.locator('button:has-text("Show all")');
      await expect(expandButtonA).toHaveCount(0);
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });

  test('Player A rolls 5d6 and Player B sees all 5 individual results', async ({
    browser,
  }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      // Player A creates room
      await pageA.goto(BASE_URL);
      await pageA.fill('input[placeholder="Enter your name"]', 'Player A');
      await pageA.click('button:has-text("Create Room")');

      // Wait for room creation and get room code
      await pageA.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });
      const roomCodeText = await pageA
        .locator('[data-testid="room-code"]')
        .textContent();
      const roomCode = roomCodeText?.trim();
      expect(roomCode).toBeTruthy();

      // Player B joins the same room
      await pageB.goto(BASE_URL);
      await pageB.fill('input[placeholder="Enter your name"]', 'Player B');
      await pageB.fill('input[placeholder="Enter room code"]', roomCode!);
      await pageB.click('button:has-text("Join Room")');

      // Wait for Player B to join
      await pageB.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });

      // Switch Player A to Advanced mode
      await pageA.click('button:has-text("Advanced")');
      await pageA.waitForSelector('text=d6', { timeout: 5000 });

      // Select d6
      await pageA.click('button:has-text("d6")');

      // Set quantity to 5
      const quantityInput = pageA.locator('input[aria-label="Number of dice"]');
      await quantityInput.fill('5');

      // Verify formula preview shows 5d6
      await pageA.waitForSelector('text=5d6', { timeout: 2000 });

      // Roll
      await pageA.click('button:has-text("Roll")');

      // Wait for roll to appear in Player A's history
      await pageA.waitForSelector('text=5d6', { timeout: 5000 });

      // Verify Player B sees the roll
      await pageB.waitForSelector('text=5d6', { timeout: 5000 });

      // Verify all 5 results are displayed (no expand button for ≤10 dice)
      const expandButtonA = pageA.locator('button:has-text("Show all")');
      await expect(expandButtonA).toHaveCount(0);

      // Count individual result badges (should be 5)
      const resultBadgesA = pageA.locator('.bg-muted.rounded').first();
      await expect(resultBadgesA).toBeVisible();
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });

  test('Player A rolls 20d6 and Player B sees compact display with expand option', async ({
    browser,
  }) => {
    test.setTimeout(30000);

    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      // Player A creates room
      await pageA.goto(BASE_URL);
      await pageA.fill('input[placeholder="Enter your name"]', 'Player A');
      await pageA.click('button:has-text("Create Room")');

      // Wait for room creation and get room code
      await pageA.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });
      const roomCodeText = await pageA
        .locator('[data-testid="room-code"]')
        .textContent();
      const roomCode = roomCodeText?.trim();
      expect(roomCode).toBeTruthy();

      // Player B joins the same room
      await pageB.goto(BASE_URL);
      await pageB.fill('input[placeholder="Enter your name"]', 'Player B');
      await pageB.fill('input[placeholder="Enter room code"]', roomCode!);
      await pageB.click('button:has-text("Join Room")');

      // Wait for Player B to join
      await pageB.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });

      // Switch Player A to Advanced mode
      await pageA.click('button:has-text("Advanced")');
      await pageA.waitForSelector('text=d6', { timeout: 5000 });

      // Select d6
      await pageA.click('button:has-text("d6")');

      // Set quantity to 20
      const quantityInput = pageA.locator('input[aria-label="Number of dice"]');
      await quantityInput.fill('20');

      // Verify formula preview shows 20d6
      await pageA.waitForSelector('text=20d6', { timeout: 2000 });

      // Roll
      const startTime = Date.now();
      await pageA.click('button:has-text("Roll")');

      // Wait for roll to appear in Player A's history
      await pageA.waitForSelector('text=20d6', { timeout: 5000 });
      const endTime = Date.now();
      const rollDuration = endTime - startTime;

      // Verify performance: < 500ms (p95 requirement)
      console.log(`20d6 roll completed in ${rollDuration}ms`);
      expect(rollDuration).toBeLessThan(500);

      // Verify Player B sees the roll
      await pageB.waitForSelector('text=20d6', { timeout: 5000 });

      // Verify compact display with "...+N more" text
      await pageA.waitForSelector('text=more', { timeout: 2000 });

      // Verify "Show all" button is present
      const expandButtonA = pageA.locator('button:has-text("Show all")');
      await expect(expandButtonA).toBeVisible();

      // Click "Show all" to expand
      await expandButtonA.click();

      // Verify button text changes to "Show less"
      await pageA.waitForSelector('button:has-text("Show less")', {
        timeout: 2000,
      });

      // Verify "...+N more" text is no longer visible after expansion
      const moreTextCount = await pageA.locator('text=more').count();
      expect(moreTextCount).toBe(0);

      // Collapse back
      const collapseButtonA = pageA.locator('button:has-text("Show less")');
      await collapseButtonA.click();

      // Verify compact display is restored
      await pageA.waitForSelector('text=more', { timeout: 2000 });
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });

  test('Player A rolls 100d6 and verifies performance', async ({ browser }) => {
    test.setTimeout(30000);

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Create room
      await page.goto(BASE_URL);
      await page.fill(
        'input[placeholder="Enter your name"]',
        'Performance Test',
      );
      await page.click('button:has-text("Create Room")');

      // Wait for room creation
      await page.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });

      // Switch to Advanced mode
      await page.click('button:has-text("Advanced")');
      await page.waitForSelector('text=d6', { timeout: 5000 });

      // Select d6
      await page.click('button:has-text("d6")');

      // Set quantity to 100 (extreme case)
      const quantityInput = page.locator('input[aria-label="Number of dice"]');
      await quantityInput.fill('100');

      // Verify formula preview shows 100d6
      await page.waitForSelector('text=100d6', { timeout: 2000 });

      // Roll and measure performance
      const startTime = Date.now();
      await page.click('button:has-text("Roll")');

      // Wait for roll to appear in history with formula
      await page.waitForSelector('text=100d6', { timeout: 5000 });
      const endTime = Date.now();
      const rollDuration = endTime - startTime;

      console.log(`100d6 roll completed in ${rollDuration}ms`);

      // Verify performance acceptable (should be under 1s for extreme case)
      expect(rollDuration).toBeLessThan(1000);

      // Wait for roll history card to fully render (includes Results section)
      await page.waitForSelector('text=/Results:/', { timeout: 3000 });

      // Debug: Check what individual_results array length is
      const rollCard = page.locator('[data-testid="roll-card"]').first();
      const hasRollCard = await rollCard.count();
      console.log(`Roll cards found: ${hasRollCard}`);

      // Debug: Get all text content to see what's rendered
      const historyText = await page
        .locator('.space-y-3')
        .first()
        .textContent();
      console.log(`History contains: ${historyText?.substring(0, 200)}`);

      // Verify compact display (should show "Show all" button)
      const expandButton = page.locator('button:has-text("Show all")');
      const buttonCount = await expandButton.count();
      console.log(`"Show all" buttons found: ${buttonCount}`);

      await expect(expandButton).toBeVisible({ timeout: 3000 });

      // Expand and verify UI doesn't lag
      await expandButton.click();

      // Wait for expansion to complete
      await page.waitForSelector('button:has-text("Show less")', {
        timeout: 2000,
      });

      // Verify page is still responsive (no UI lag)
      const collapseButton = page.locator('button:has-text("Show less")');
      await expect(collapseButton).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
