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
  await expect(page.getByTestId(`player-${playerName}`)).toBeVisible({ timeout: 5000 });
  
  // Add client-side logging
  await page.evaluate(() => {
    const socket = (window as any).socket;
    if (socket) {
      socket.on('roll_result', (data: any) => {
        console.log('ROLL_RESULT_RECEIVED:', JSON.stringify(data));
      });
    }
  });

  // Roll dice
  const diceInput = page.getByPlaceholder('1d20+5');
  await diceInput.fill('1d20');
  await page.getByRole('button', { name: /roll/i }).click();
  
  // Wait longer to see if event arrives
  await page.waitForTimeout(3000);
  
  // Check console logs
  console.log('All console logs:', consoleLogs);
  const handleRollLogs = consoleLogs.filter(l => l.includes('RoomView handleRoll'));
  console.log('HandleRoll logs:', handleRollLogs);
  
  // Check if roll appears in UI
  const rollItems = page.locator('ul[role="list"] li');
  const count = await rollItems.count();
  console.log(`Roll items in UI: ${count}`);
  
  expect(count).toBeGreaterThan(0);
});
