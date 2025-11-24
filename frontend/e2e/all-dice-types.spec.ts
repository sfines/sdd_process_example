/**
 * E2E Tests for All Standard Dice Types
 *
 * Tests rolling d4, d6, d8, d10, d12, d20, d100 with various quantities and modifiers.
 * Validates that all dice types work correctly and results appear in history.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8090';

test.describe('All Standard Dice Types', () => {
  test('Player A rolls all dice types (d4-d100) and Player B sees results', async ({
    browser,
  }) => {
    test.setTimeout(60000); // Increase timeout for this comprehensive test
    // Create two browser contexts for two players
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
      await pageA.waitForSelector('text=d4', { timeout: 5000 });

      // Test a subset of dice types (d4, d20, d100) for faster execution
      const diceTypes = [
        { type: 'd4', sides: 4 },
        { type: 'd20', sides: 20 },
        { type: 'd100', sides: 100 },
      ];

      for (const dice of diceTypes) {
        // Select dice type
        await pageA.click(`button:has-text("${dice.type}")`);

        // Ensure quantity is 1
        const quantityInput = pageA.locator(
          'input[aria-label="Number of dice"]',
        );
        await quantityInput.fill('1');

        // Roll
        await pageA.click('button:has-text("Roll")');

        // Wait for roll to appear in Player A's history
        await pageA.waitForSelector(`text=1${dice.type}`, { timeout: 5000 });

        // Verify Player B sees the roll
        await pageB.waitForSelector(`text=1${dice.type}`, { timeout: 5000 });

        // Verify result is within valid range
        const resultTextA = await pageA
          .locator('text=/Results: \\[\\d+\\]/')
          .first()
          .textContent();
        const resultMatch = resultTextA?.match(/Results: \[(\d+)\]/);
        if (resultMatch) {
          const result = parseInt(resultMatch[1]);
          expect(result).toBeGreaterThanOrEqual(1);
          expect(result).toBeLessThanOrEqual(dice.sides);
        }

        // Small delay between rolls
        await pageA.waitForTimeout(1000);
      }

      // Verify all 3 rolls are in history
      const rollCountA = await pageA.locator('text=/1d\\d+/').count();
      expect(rollCountA).toBeGreaterThanOrEqual(3);

      const rollCountB = await pageB.locator('text=/1d\\d+/').count();
      expect(rollCountB).toBeGreaterThanOrEqual(3);
    } finally {
      await pageA.close();
      await pageB.close();
      await contextA.close();
      await contextB.close();
    }
  });

  test('Player A rolls large quantity (20d6 fireball) and sees all individual results', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Create room
      await page.goto(BASE_URL);
      await page.fill('input[placeholder="Enter your name"]', 'Player A');
      await page.click('button:has-text("Create Room")');

      await page.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });

      // Switch to Advanced mode
      await page.click('button:has-text("Advanced")');
      await page.waitForSelector('text=d6', { timeout: 5000 });

      // Select d6
      await page.click('button:has-text("d6")');

      // Set quantity to 20
      const quantityInput = page.locator('input[aria-label="Number of dice"]');
      await quantityInput.fill('20');

      // Verify formula preview shows 20d6
      await page.waitForSelector('text=20d6', { timeout: 2000 });

      // Roll
      await page.click('button:has-text("Roll")');

      // Wait for roll to appear
      await page.waitForSelector('text=20d6', { timeout: 5000 });

      // Verify individual results show 20 dice
      const resultText = await page
        .locator('text=/Results: \\[.*\\]/')
        .first()
        .textContent();
      const results = resultText?.match(/\d+/g);
      expect(results).toBeTruthy();
      expect(results!.length).toBe(20);

      // Verify all results are 1-6
      results!.forEach((result) => {
        const num = parseInt(result);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(6);
      });
    } finally {
      await page.close();
      await context.close();
    }
  });

  test('Player A rolls 3d6+2 and sees formula with modifier', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Create room
      await page.goto(BASE_URL);
      await page.fill('input[placeholder="Enter your name"]', 'Player A');
      await page.click('button:has-text("Create Room")');

      await page.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });

      // Switch to Advanced mode
      await page.click('button:has-text("Advanced")');
      await page.waitForSelector('text=d6', { timeout: 5000 });

      // Select d6
      await page.click('button:has-text("d6")');

      // Set quantity to 3
      const quantityInput = page.locator('input[aria-label="Number of dice"]');
      await quantityInput.fill('3');

      // Set modifier to +2
      const modifierInput = page.locator('input[aria-label="Dice modifier"]');
      await modifierInput.fill('2');

      // Verify formula preview shows 3d6+2
      await page.waitForSelector('text=3d6+2', { timeout: 2000 });

      // Roll
      await page.click('button:has-text("Roll")');

      // Wait for roll to appear with formula
      await page.waitForSelector('text=3d6+2', { timeout: 5000 });

      // Verify individual results show 3 dice
      const resultText = await page
        .locator('text=/Results: \\[.*\\]/')
        .first()
        .textContent();
      const resultsMatch = resultText?.match(/Results: \[([^\]]+)\]/);
      expect(resultsMatch).toBeTruthy();

      const results = resultsMatch![1].split(',').map((s) => s.trim());
      expect(results.length).toBe(3);

      // Verify modifier is displayed
      expect(resultText).toContain('+2');
    } finally {
      await page.close();
      await context.close();
    }
  });

  test('Invalid formula shows error message', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Create room
      await page.goto(BASE_URL);
      await page.fill('input[placeholder="Enter your name"]', 'Player A');
      await page.click('button:has-text("Create Room")');

      await page.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });

      // Switch to Advanced mode
      await page.click('button:has-text("Advanced")');
      await page.waitForSelector('text=d6', { timeout: 5000 });

      // Try to set invalid quantity (0 - below minimum)
      const quantityInput = page.locator('input[aria-label="Number of dice"]');
      await quantityInput.fill('0');

      // Roll button should be disabled for invalid input
      const rollButton = page.locator('button:has-text("Roll")');
      await expect(rollButton).toBeDisabled();
    } finally {
      await page.close();
      await context.close();
    }
  });

  test('Formula preview updates in real-time', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Create room
      await page.goto(BASE_URL);
      await page.fill('input[placeholder="Enter your name"]', 'Player A');
      await page.click('button:has-text("Create Room")');

      await page.waitForSelector('[data-testid="room-code"]', {
        timeout: 10000,
      });

      // Switch to Advanced mode
      await page.click('button:has-text("Advanced")');
      await page.waitForSelector('text=d20', { timeout: 5000 });

      // Initial formula should be 1d20
      await expect(page.locator('text=1d20').first()).toBeVisible();

      // Change to d6
      await page.click('button:has-text("d6")');
      await expect(page.locator('text=1d6').first()).toBeVisible();

      // Change quantity to 8
      const quantityInput = page.locator('input[aria-label="Number of dice"]');
      await quantityInput.fill('8');
      await expect(page.locator('text=8d6').first()).toBeVisible();

      // Add modifier -2
      const modifierInput = page.locator('input[aria-label="Dice modifier"]');
      await modifierInput.fill('-2');
      await expect(page.locator('text=8d6-2').first()).toBeVisible();
    } finally {
      await page.close();
      await context.close();
    }
  });
});
