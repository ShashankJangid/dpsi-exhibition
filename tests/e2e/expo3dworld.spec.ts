import { test, expect } from '@playwright/test';
import { ExpoWorldPage } from '../pages/ExpoWorldPage';

test.describe('Expo 3D World — Production Readiness & Resilience Suite', () => {
  test('1. 3D Canvas initialization and loader dismissal (or graceful fallback)', async ({ page }) => {
    const expoPage = new ExpoWorldPage(page);
    await expoPage.goto();

    await expoPage.waitForSceneOrFallback();

    const isCanvasVisible = await expoPage.canvasElement.isVisible();
    if (isCanvasVisible) {
      await expect(expoPage.canvasWrapper).toBeVisible();
      // Verify WebGL context loss listener supports preventDefault() without full page reload
      const defaultPrevented = await expoPage.canvasElement.evaluate((canvas) => {
        const evt = new Event('webglcontextlost', { cancelable: true });
        canvas.dispatchEvent(evt);
        return evt.defaultPrevented;
      });
      expect(defaultPrevented).toBe(true);
      await expect(expoPage.webglContextLostBanner).toBeVisible();

      // Dispatch webglcontextrestored and verify recovery overlay dismisses
      await expoPage.canvasElement.evaluate((canvas) => {
        canvas.dispatchEvent(new Event('webglcontextrestored'));
      });
      await expect(expoPage.webglContextLostBanner).toBeHidden();
    } else {
      await expect(expoPage.twoDFallbackGrid).toBeVisible();
    }
  });

  test('2. Deep-linking via query parameters (?booth=P01 and ?zone=zone-1)', async ({ page }) => {
    const expoPage = new ExpoWorldPage(page);

    // Test ?booth=P01 deep link opens ProjectDetailDrawer and updates ARIA live region
    await expoPage.goto('?booth=P01');
    await expect(expoPage.projectDetailDialog).toBeVisible({ timeout: 20000 });
    await expect(expoPage.projectDetailDialog).toContainText('Booth P01');
    await expect(expoPage.boothAriaLiveRegion).toContainText('Selected booth P01:');

    // Close project modal
    await page.getByRole('button', { name: 'Close project modal' }).click();
    await expect(expoPage.projectDetailDialog).toBeHidden();

    // Test ?zone=zone-1 deep link activates Show & Tell zone
    await expoPage.goto('?zone=zone-1');
    await expoPage.waitForSceneOrFallback();
    await expect(page.getByText('Show & Tell Pavilion').first()).toBeVisible({ timeout: 15000 });
  });

  test('3. Smooth toggle between 3D Canvas and 2D Bento Grid plus accessible skip-link', async ({ page }) => {
    const expoPage = new ExpoWorldPage(page);
    await expoPage.goto();
    await expoPage.waitForSceneOrFallback();

    // Verify accessible skip-link is present and switches to 2D Floor Plan Grid
    await expect(expoPage.skipTo2DLink).toBeAttached();
    await expoPage.skipTo2DLink.focus();
    await expoPage.skipTo2DLink.press('Enter');

    await expect(expoPage.twoDFallbackGrid).toBeVisible({ timeout: 10000 });
    await expect(expoPage.twoDFallbackGrid).toContainText('OFFICIAL FLOOR PLAN DIRECTORY');

    // Toggle back to 3D and then back to 2D via HUD controls
    await expoPage.switchTo3DView();
    await expoPage.switchTo2DView();
    await expect(expoPage.twoDFallbackGrid).toBeVisible();
  });

  test('4. Booth selection interaction and ProjectDetailDrawer visibility', async ({ page }) => {
    const expoPage = new ExpoWorldPage(page);
    await expoPage.goto();
    await expoPage.waitForSceneOrFallback();

    // Close initial segment inspector if open so radar minimap can be interacted with cleanly
    const closeSegmentBtn = page.locator('button[title="Close Segment Overview"]');
    if (await closeSegmentBtn.isVisible()) {
      await closeSegmentBtn.click();
    }

    await expoPage.selectBooth('D01');

    await expect(expoPage.projectDetailDialog).toBeVisible({ timeout: 15000 });
    await expect(expoPage.projectDetailDialog).toContainText('Booth D01');
    await expect(expoPage.boothAriaLiveRegion).toContainText('Selected booth D01:');
    await expect(expoPage.boothAriaLiveRegion).toContainText('Category: Digital');
  });

  test('5. Headless WebGL context failure simulation engages 2D fallback cleanly', async ({ page }) => {
    const expoPage = new ExpoWorldPage(page);
    await expoPage.simulateHeadlessWebGLFailure();
    await expoPage.goto();

    await expect(expoPage.twoDFallbackGrid).toBeVisible({ timeout: 15000 });
    await expect(expoPage.webglFallbackNotice).toBeVisible();
    await expect(expoPage.webglFallbackNotice).toContainText('2D Floor Plan');
  });
});
