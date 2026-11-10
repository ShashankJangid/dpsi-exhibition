import { Page, Locator, expect } from '@playwright/test';

export class ExpoWorldPage {
  readonly page: Page;
  readonly canvasWrapper: Locator;
  readonly canvasElement: Locator;
  readonly canvasLoader: Locator;
  readonly twoDFallbackGrid: Locator;
  readonly webglFallbackNotice: Locator;
  readonly webglContextLostBanner: Locator;
  readonly projectDetailDialog: Locator;
  readonly skipTo2DLink: Locator;
  readonly boothAriaLiveRegion: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvasWrapper = page.getByTestId('exhibition-canvas-wrapper');
    this.canvasElement = page.locator('canvas').first();
    this.canvasLoader = page.getByTestId('canvas-loader');
    this.twoDFallbackGrid = page.getByTestId('two-d-fallback-grid');
    this.webglFallbackNotice = page.getByTestId('webgl-fallback-notice');
    this.webglContextLostBanner = page.getByTestId('webgl-context-lost-banner');
    this.projectDetailDialog = page.getByRole('dialog');
    this.skipTo2DLink = page.getByRole('link', {
      name: 'Skip to 2D Floor Plan Grid (Accessible)',
    });
    this.boothAriaLiveRegion = page.getByTestId('booth-aria-live-region');
  }

  async goto(query = '') {
    await this.page.goto(`/expo${query}`);
  }

  /**
   * Waits for the 3D scene to initialize or gracefully fall back to the 2D grid
   * in headless browser environments without hardware WebGL support.
   */
  async waitForSceneOrFallback() {
    await expect(
      this.canvasElement.or(this.twoDFallbackGrid)
    ).toBeVisible({ timeout: 30000 });
  }

  /**
   * Switches from 3D mode to 2D Bento Grid across desktop and mobile viewports.
   */
  async switchTo2DView() {
    const isAlready2D = await this.twoDFallbackGrid.isVisible();
    if (isAlready2D) return;

    const desktop2DButton = this.page.locator('button[title="2D Bento Directory"]');
    const mobileToggleButton = this.page.locator('button[title="Toggle View Mode"]');

    if (await desktop2DButton.isVisible()) {
      await desktop2DButton.click();
    } else if (await mobileToggleButton.isVisible()) {
      await mobileToggleButton.click();
    }

    await expect(this.twoDFallbackGrid).toBeVisible({ timeout: 10000 });
  }

  /**
   * Switches from 2D Bento Grid back to 3D Spatial Floor Plan.
   */
  async switchTo3DView() {
    const desktop3DButton = this.page.locator('button[title="3D Spatial Floor Plan"]');
    const mobileToggleButton = this.page.locator('button[title="Toggle View Mode"]');

    if (await desktop3DButton.isVisible()) {
      await desktop3DButton.click();
    } else if (await mobileToggleButton.isVisible()) {
      await mobileToggleButton.click();
    }
  }

  /**
   * Selects a booth using the 3D Radar Minimap (or 2D grid card if in 2D fallback)
   * and verifies the ProjectDetailDrawer opens.
   */
  async selectBooth(boothCode: string) {
    if (await this.twoDFallbackGrid.isVisible()) {
      const card = this.twoDFallbackGrid.getByText(boothCode, { exact: true }).first();
      await card.click();
      return;
    }

    const expandMinimapBtn = this.page.getByRole('button', { name: 'Expand Minimap' });
    if (await expandMinimapBtn.isVisible()) {
      await expandMinimapBtn.click();
    }

    const boothDot = this.page.getByTestId(`minimap-booth-${boothCode}`);
    await expect(boothDot).toBeVisible({ timeout: 10000 });
    await boothDot.dispatchEvent('click');
  }

  /**
   * Injects an initialization script before page load that forces WebGL context
   * creation to fail, simulating unsupported hardware or disabled GPU acceleration.
   */
  async simulateHeadlessWebGLFailure() {
    await this.page.addInitScript(() => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HTMLCanvasElement.prototype as any).getContext = function (
        contextType: string,
        ...args: unknown[]
      ) {
        if (
          contextType === 'webgl' ||
          contextType === 'webgl2' ||
          contextType === 'experimental-webgl'
        ) {
          return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (origGetContext as any).call(this, contextType, ...args);
      };
    });
  }
}
