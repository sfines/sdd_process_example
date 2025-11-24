import { test, expect } from '@playwright/test';

test('final debug - check state before roll', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

  const playerName = `TestPlayer${Math.floor(Math.random() * 10000)}`;
  await page.getByLabel('Your Name').first().fill(playerName);
  await page.getByRole('button', { name: /create room/i }).click();

  await page.waitForURL(/\/room\/.+/, { timeout: 5000 });
  await expect(page.getByText('Game Room')).toBeVisible();

  // Wait for player in list
  await expect(page.getByTestId(`player-${playerName}`)).toBeVisible({
    timeout: 5000,
  });

  // NOW check what RoomView will use
  const stateAtRollTime = await page.evaluate(() => {
    // Access the React component's props/state via the DOM
    // This is hacky but will tell us what's happening
    const rollButton = document.querySelector('button[type="button"]');
    return {
      buttonExists: !!rollButton,
      pageHTML: document.body.innerHTML.substring(0, 500),
    };
  });

  console.log('State check:', stateAtRollTime);

  // Roll dice using Simple mode
  await page.getByRole('button', { name: /roll/i }).click();
  await page.waitForTimeout(2000);

  console.log('Expected player name:', playerName);
});
