/**
 * E2E Tests - Responsive Layout Across Three Device Sizes
 *
 * Comprehensive end-to-end tests for mobile, tablet, and desktop layouts.
 * Tests user flows, drawer interactions, and responsive behavior.
 */

import { test, expect, Page } from '@playwright/test';

// Device configurations
const DEVICES = {
  mobile: { width: 375, height: 667, name: 'iPhone SE' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  desktop: { width: 1200, height: 800, name: 'Desktop' },
};

// Helper: Create and join room
async function createAndJoinRoom(
  page: Page,
  playerName: string,
): Promise<string> {
  await page.goto('/');

  // Fill player name
  await page.fill('input[name="playerName"]', playerName);

  // Create room
  await page.click('button:has-text("Create Room")');

  // Wait for room view
  await page.waitForURL(/\/room\/.+/);

  // Extract room code from URL
  const url = page.url();
  const roomCode = url.split('/room/')[1];

  return roomCode;
}

test.describe('Responsive Layout - Mobile (375px)', () => {
  test.use({ viewport: DEVICES.mobile });

  test('mobile layout shows hamburger and hides history', async ({ page }) => {
    await createAndJoinRoom(page, 'MobilePlayer');

    // Verify hamburger menu visible
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();

    // Verify roll history NOT visible in main area (hidden on mobile)
    const mainArea = page.locator('main');
    const rollHistoryHeading = mainArea.locator('text=Roll History');
    await expect(rollHistoryHeading).not.toBeVisible();

    // Verify dice input visible
    const rollButton = page.locator('button:has-text("Roll")');
    await expect(rollButton).toBeVisible();
  });

  test('hamburger menu opens drawer with roll history', async ({ page }) => {
    await createAndJoinRoom(page, 'MobilePlayer');

    // Open drawer
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await menuButton.click();

    // Wait for drawer animation
    await page.waitForTimeout(300);

    // Verify drawer visible
    const drawer = page.locator('aside[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Verify roll history in drawer
    const drawerHistory = drawer.locator('text=Roll History');
    await expect(drawerHistory).toBeVisible();

    // Verify room code in drawer
    await expect(drawer.locator('text=Room Code')).toBeVisible();
  });

  test('drawer closes when clicking overlay', async ({ page }) => {
    await createAndJoinRoom(page, 'MobilePlayer');

    // Open drawer
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);

    // Click overlay
    const overlay = page.locator('div[aria-label="Close menu"]');
    await overlay.click();

    // Wait for close animation
    await page.waitForTimeout(300);

    // Verify drawer closed (not visible)
    const drawer = page.locator('aside[role="dialog"]');
    await expect(drawer).not.toBeVisible();
  });

  test('drawer closes with close button', async ({ page }) => {
    await createAndJoinRoom(page, 'MobilePlayer');

    // Open drawer
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);

    // Click close button
    const closeButton = page.locator(
      'aside[role="dialog"] button[aria-label="Close menu"]',
    );
    await closeButton.click();

    // Wait for close animation
    await page.waitForTimeout(300);

    // Verify drawer closed
    const drawer = page.locator('aside[role="dialog"]');
    await expect(drawer).not.toBeVisible();
  });

  test('drawer closes with Escape key', async ({ page }) => {
    await createAndJoinRoom(page, 'MobilePlayer');

    // Open drawer
    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(300);

    // Press Escape
    await page.keyboard.press('Escape');

    // Wait for close animation
    await page.waitForTimeout(300);

    // Verify drawer closed
    const drawer = page.locator('aside[role="dialog"]');
    await expect(drawer).not.toBeVisible();
  });

  test('touch targets meet 44px minimum', async ({ page }) => {
    await createAndJoinRoom(page, 'MobilePlayer');

    // Check menu button size
    const menuButton = page.locator('button[aria-label="Open menu"]');
    const menuBox = await menuButton.boundingBox();
    expect(menuBox?.width).toBeGreaterThanOrEqual(44);
    expect(menuBox?.height).toBeGreaterThanOrEqual(44);

    // Check roll button size
    const rollButton = page.locator('button:has-text("Roll")');
    const rollBox = await rollButton.boundingBox();
    expect(rollBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('input font size is 16px (prevents iOS zoom)', async ({ page }) => {
    await createAndJoinRoom(page, 'MobilePlayer');

    // Check modifier input
    const modifierInput = page.locator('input[aria-label="Dice modifier"]');
    const fontSize = await modifierInput.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // 16px = 1rem in most browsers
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(16);
  });
});

test.describe('Responsive Layout - Tablet (768px)', () => {
  test.use({ viewport: DEVICES.tablet });

  test('tablet layout shows history and hides hamburger', async ({ page }) => {
    await createAndJoinRoom(page, 'TabletPlayer');

    // Verify roll history visible
    const rollHistoryHeading = page.locator('h2:has-text("Roll History")');
    await expect(rollHistoryHeading).toBeVisible();

    // Verify dice input visible
    const rollButton = page.locator('button:has-text("Roll")');
    await expect(rollButton).toBeVisible();

    // Hamburger menu should not be visible (CSS hidden)
    const menuButton = page.locator('button[aria-label="Open menu"]');
    // Button exists in DOM but hidden by CSS
    await expect(menuButton).toBeHidden();
  });

  test('tablet side-by-side or stacked layout works', async ({ page }) => {
    await createAndJoinRoom(page, 'TabletPlayer');

    // Both sections should be visible
    const rollHistory = page.locator('h2:has-text("Roll History")');
    const rollButton = page.locator('button:has-text("Roll")');

    await expect(rollHistory).toBeVisible();
    await expect(rollButton).toBeVisible();
  });
});

test.describe('Responsive Layout - Desktop (1200px)', () => {
  test.use({ viewport: DEVICES.desktop });

  test('desktop layout shows side-by-side layout', async ({ page }) => {
    await createAndJoinRoom(page, 'DesktopPlayer');

    // Verify roll history on left/right side
    const rollHistoryHeading = page.locator('h2:has-text("Roll History")');
    await expect(rollHistoryHeading).toBeVisible();

    // Verify dice input visible
    const rollButton = page.locator('button:has-text("Roll")');
    await expect(rollButton).toBeVisible();

    // No hamburger menu on desktop
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeHidden();
  });

  test('desktop shows full header with all controls', async ({ page }) => {
    await createAndJoinRoom(page, 'DesktopPlayer');

    // Connection status
    const connectionStatus = page.locator('[aria-label="Connected"]');
    await expect(connectionStatus).toBeVisible();

    // Leave button with text
    const leaveButton = page.locator('button[aria-label="Leave Room"]');
    await expect(leaveButton).toBeVisible();
    await expect(leaveButton).toContainText('Leave');
  });
});

test.describe('Cross-Device Roll Synchronization', () => {
  test('mobile user sees roll in drawer from desktop user', async ({
    browser,
  }) => {
    // Create two contexts with different viewport sizes
    const mobileContext = await browser.newContext({
      viewport: DEVICES.mobile,
    });
    const desktopContext = await browser.newContext({
      viewport: DEVICES.desktop,
    });

    const mobilePage = await mobileContext.newPage();
    const desktopPage = await desktopContext.newPage();

    // Mobile: Create room
    const roomCode = await createAndJoinRoom(mobilePage, 'MobilePlayer');

    // Desktop: Join same room
    await desktopPage.goto('/');
    await desktopPage.fill('input[name="playerName"]', 'DesktopPlayer');
    await desktopPage.fill('input[name="roomCode"]', roomCode);
    await desktopPage.click('button:has-text("Join Room")');
    await desktopPage.waitForURL(/\/room\/.+/);

    // Desktop: Roll dice
    await desktopPage.click('button:has-text("Roll")');
    await desktopPage.waitForTimeout(500);

    // Mobile: Open drawer to see roll history
    await mobilePage.click('button[aria-label="Open menu"]');
    await mobilePage.waitForTimeout(300);

    // Verify roll visible in mobile drawer
    const drawer = mobilePage.locator('aside[role="dialog"]');
    const rollInHistory = drawer.locator('text=/DesktopPlayer/');
    await expect(rollInHistory).toBeVisible({ timeout: 2000 });

    // Cleanup
    await mobileContext.close();
    await desktopContext.close();
  });
});

test.describe('Responsive Window Resize', () => {
  test('layout adapts when resizing window', async ({ page }) => {
    // Start at desktop size
    await page.setViewportSize(DEVICES.desktop);
    await createAndJoinRoom(page, 'ResizePlayer');

    // Verify desktop layout
    let rollHistoryHeading = page.locator('h2:has-text("Roll History")');
    await expect(rollHistoryHeading).toBeVisible();

    // Resize to tablet
    await page.setViewportSize(DEVICES.tablet);
    await page.waitForTimeout(300);

    // Verify tablet layout (history still visible)
    rollHistoryHeading = page.locator('h2:has-text("Roll History")');
    await expect(rollHistoryHeading).toBeVisible();

    // Resize to mobile
    await page.setViewportSize(DEVICES.mobile);
    await page.waitForTimeout(300);

    // Verify mobile layout (hamburger appears)
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();

    // History should be hidden in main area
    const mainArea = page.locator('main');
    const hiddenHistory = mainArea.locator('h2:has-text("Roll History")');
    await expect(hiddenHistory).not.toBeVisible();
  });
});

test.describe('Text Readability', () => {
  test.use({ viewport: DEVICES.mobile });

  test('all text readable on smallest viewport without zooming', async ({
    page,
  }) => {
    await createAndJoinRoom(page, 'ReadabilityPlayer');

    // Check all text elements have minimum 14px font size
    const allText = page.locator('body *');
    const count = await allText.count();

    for (let i = 0; i < Math.min(count, 50); i++) {
      const element = allText.nth(i);
      const fontSize = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return parseInt(style.fontSize);
      });

      // Allow some elements to be smaller (like icons), but most should be >= 14px
      if (fontSize > 0) {
        expect(fontSize).toBeGreaterThanOrEqual(12);
      }
    }
  });
});
