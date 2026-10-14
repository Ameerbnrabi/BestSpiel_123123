import { test, expect } from '@playwright/test';

test.describe('BestSpiel Game App', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial page title and HUD elements', async ({ page }) => {
    await expect(page).toHaveTitle(/BestSpiel/i);

    const heading = page.locator('h1');
    await expect(heading).toContainText('BestSpiel');

    const scoreEl = page.locator('#score');
    await expect(scoreEl).toHaveText('0');

    const highScoreEl = page.locator('#highScore');
    await expect(highScoreEl).toBeVisible();

    const startBtn = page.locator('#startBtn');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toHaveText('Start Game');
  });

  test('should hide overlay and start game when Start Game button is clicked', async ({ page }) => {
    const overlay = page.locator('#gameOverlay');
    const startBtn = page.locator('#startBtn');

    await expect(overlay).not.toHaveClass(/hidden/);
    await startBtn.click();
    await expect(overlay).toHaveClass(/hidden/);
  });

  test('should allow player keyboard controls during gameplay', async ({ page }) => {
    await page.click('#startBtn');

    // Press movement keys
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('KeyW');
    await page.keyboard.press('KeyD');

    // Confirm canvas is still present and score is valid
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    const scoreEl = page.locator('#score');
    const text = await scoreEl.textContent();
    expect(parseInt(text || '0', 10)).toBeGreaterThanOrEqual(0);
  });

  test('should render canvas element correctly', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox.width).toBeGreaterThan(0);
    expect(boundingBox.height).toBeGreaterThan(0);
  });

});
