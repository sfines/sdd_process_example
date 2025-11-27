import { test, expect } from '@playwright/test';

test('inspect zustand state after room creation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });

  const playerName = `TestPlayer${Math.floor(Math.random() * 10000)}`;
  await page.getByLabel('Your Name').first().fill(playerName);
  await page.getByRole('button', { name: /create room/i }).click();
  
  await page.waitForURL(/\/room\/.+/, { timeout: 5000 });
  await expect(page.getByText('Game Room')).toBeVisible();
  
  // Wait for state to settle
  await page.waitForTimeout(1000);
  
  // Directly inspect DOM to find player in player list
  const playerInList = await page.getByTestId(`player-${playerName}`).isVisible();
  console.log(`Player "${playerName}" visible in player list: ${playerInList}`);
  
  // Check current player ID display (if shown somewhere)
  const pageContent = await page.content();
  console.log('Page contains player name:', pageContent.includes(playerName));
  
  // Try to extract what RoomView is seeing by checking text content
  const playersSection = page.locator('text=Players').locator('..');
  const playersSectionText = await playersSection.textContent();
  console.log('Players section text:', playersSectionText);
});
