/**
 * Simplified roll test for debugging
 */

import { test, expect } from '@playwright/test';

test('simple roll test with console monitoring', async ({ page }) => {
  // Monitor console logs
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    // Also print immediately for debugging
    console.log(`[BROWSER ${msg.type()}]`, text);
  });

  await page.goto('/');
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

  const playerName = `TestPlayer${Math.floor(Math.random() * 10000)}`;
  await page.getByLabel('Your Name').first().fill(playerName);
  await page.getByRole('button', { name: /create room/i }).click();

  await page.waitForURL(/\/room\/.+/, { timeout: 5000 });
  await expect(page.getByText('Game Room')).toBeVisible();

  // Wait for player to appear
  await expect(page.getByTestId(`player-${playerName}`)).toBeVisible({
    timeout: 5000,
  });

  // Add client-side logging
  await page.evaluate(() => {
    const socket = (window as any).socket;
    if (socket) {
      socket.on('roll_result', (data: any) => {
        console.log('ROLL_RESULT_RECEIVED:', JSON.stringify(data));
      });
    }
  });

  // Roll dice using Simple mode (default 1d20)
  await page.getByRole('button', { name: /roll/i }).click();

  // Wait for roll result event to be received (check console logs)
  await page.waitForTimeout(2000);

  // Take screenshot to see what's actually rendered
  await page.screenshot({
    path: 'test-results/room-view-state.png',
    fullPage: true,
  });

  // Check what's actually in the DOM
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log(
    'DOM contains VirtualRollHistory?',
    bodyHTML.includes('virtual-roll'),
  );
  console.log('DOM contains data-testid?', bodyHTML.includes('data-testid'));
  console.log(
    'DOM contains Roll History heading?',
    bodyHTML.includes('Roll History'),
  );

  // Check console logs
  console.log('All console logs:', consoleLogs);
  const handleRollLogs = consoleLogs.filter((l) =>
    l.includes('RoomView handleRoll'),
  );
  console.log('HandleRoll logs:', handleRollLogs);

  // Try finding ANY roll history container
  const anyRollContainer = await page.locator('[class*="roll"]').count();
  console.log(`Elements with 'roll' in class: ${anyRollContainer}`);

  // Look for CardContent that should wrap VirtualRollHistory
  const cardContents = await page
    .locator('.space-y-3, [data-testid="virtual-roll-history"]')
    .count();
  console.log(`Card contents or virtual history: ${cardContents}`);

  expect(anyRollContainer).toBeGreaterThan(0);
});
