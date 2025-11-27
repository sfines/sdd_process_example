import { test, expect } from '@playwright/test';

test('detailed state debugging', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

  const playerName = `TestPlayer${Math.floor(Math.random() * 10000)}`;

  // Inject logging into page
  await page.addInitScript(() => {
    (window as any).stateLog = [];
  });

  await page.getByLabel('Your Name').first().fill(playerName);
  await page.getByRole('button', { name: /create room/i }).click();

  await page.waitForURL(/\/room\/.+/, { timeout: 5000 });
  await expect(page.getByText('Game Room')).toBeVisible();

  // Wait for render
  await page.waitForTimeout(1000);

  // Capture state just before roll
  const stateBeforeRoll = await page.evaluate(() => {
    const zustandStore = (window as any).zustandStores?.socketStore;
    if (!zustandStore) return { error: 'No zustand store found' };

    const state = zustandStore.getState();
    return {
      currentPlayerId: state.currentPlayerId,
      players: state.players,
      roomCode: state.roomCode,
    };
  });

  console.log('State before roll:', JSON.stringify(stateBeforeRoll, null, 2));

  // Try to roll using Simple mode
  await page.getByRole('button', { name: /roll/i }).click();

  await page.waitForTimeout(2000);

  // Check what was sent
  console.log('Expected player name:', playerName);
});
