/**
 * Debug player state test
 */

import { test, expect } from '@playwright/test';

test('debug player state after room creation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

  const playerName = `Debug${Math.floor(Math.random() * 10000)}`;
  await page.getByLabel('Your Name').first().fill(playerName);
  await page.getByRole('button', { name: /create room/i }).click();
  
  await page.waitForURL(/\/room\/.+/, { timeout: 5000 });
  await expect(page.getByText('Game Room')).toBeVisible();
  
  // Check store state
  const storeState = await page.evaluate(() => {
    const store = (window as any).__SOCKET_STORE__;
    if (!store) return null;
    const state = store.getState();
    return {
      currentPlayerId: state.currentPlayerId,
      players: state.players,
      playersLength: state.players?.length || 0
    };
  });
  
  console.log('Store state after room creation:', JSON.stringify(storeState, null, 2));
  
  // Wait a bit
  await page.waitForTimeout(1000);
  
  // Check again
  const storeState2 = await page.evaluate(() => {
    const store = (window as any).__SOCKET_STORE__;
    if (!store) return null;
    const state = store.getState();
    return {
      currentPlayerId: state.currentPlayerId,
      players: state.players,
      playersLength: state.players?.length || 0
    };
  });
  
  console.log('Store state after 1s:', JSON.stringify(storeState2, null, 2));
});
