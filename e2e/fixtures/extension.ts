import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

type ExtensionFixtures = {
  context: BrowserContext;
  extensionId: string;
};

/**
 * Load Chess.com authentication cookies if available
 */
async function loadAuthCookies() {
  const authConfigPath = path.join(process.cwd(), 'e2e', 'auth.config.ts');
  
  if (existsSync(authConfigPath)) {
    try {
      const { authConfig } = await import('../auth.config');
      return authConfig.cookies || [];
    } catch (error) {
      console.warn('⚠️  auth.config.ts found but could not load cookies:', error);
      return [];
    }
  }
  
  console.log('ℹ️  No auth.config.ts found - running tests without Chess.com login');
  return [];
}

/**
 * Custom Playwright fixture for testing browser extensions
 * Loads the extension from dist_chrome and provides helper methods
 */
export const test = base.extend<ExtensionFixtures>({
  // Override context to load the extension
  context: async ({ }, use) => {
    const pathToExtension = path.join(process.cwd(), 'dist_chrome');
    
    const context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions require headed mode
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox',
      ],
    });
    
    // Inject Chess.com cookies if available
    const cookies = await loadAuthCookies();
    if (cookies.length > 0) {
      await context.addCookies(cookies);
      console.log('✅ Injected Chess.com authentication cookies');
    }
    
    await use(context);
    await context.close();
  },

  // Provide the extension ID for accessing extension pages
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper: Open the extension popup
 * Important: Make sure to call page.bringToFront() on the Chess.com tab
 * BEFORE calling this function, so the popup can detect the correct active tab
 */
export async function openPopup(context: BrowserContext, extensionId: string) {
  const popupUrl = `chrome-extension://${extensionId}/src/pages/popup/index.html`;
  const page = await context.newPage();
  await page.goto(popupUrl);
  
  // Give popup extra time to query the active tab and get game state
  await page.waitForTimeout(500);
  
  return page;
}

/**
 * Helper: Open extension options page
 */
export async function openOptions(context: BrowserContext, extensionId: string) {
  const optionsUrl = `chrome-extension://${extensionId}/src/pages/options/index.html`;
  const page = await context.newPage();
  await page.goto(optionsUrl);
  return page;
}

/**
 * Helper: Wait for extension to be ready
 */
export async function waitForExtensionReady(context: BrowserContext, extensionId?: string) {
  // Wait for service worker to be active
  const [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    await context.waitForEvent('serviceworker');
  }
  
  // Give extension time to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Log extension info for debugging
  if (extensionId) {
    console.log('🔧 Extension loaded with ID:', extensionId);
    console.log(`📌 To pin extension: chrome://extensions/ → Find "Lichess4Chess" → Click pin icon`);
    console.log(`🔗 Extension popup: chrome-extension://${extensionId}/src/pages/popup/index.html`);
  }
}

/**
 * Helper: Wait for user to manually interact (useful for debugging)
 * Set MANUAL_TEST=true environment variable to enable
 */
export async function waitForManualInteraction(message: string, timeoutMs: number = 30000) {
  if (process.env.MANUAL_TEST === 'true') {
    console.log(`\n⏸️  PAUSED: ${message}`);
    console.log(`   Waiting ${timeoutMs / 1000}s for manual interaction...`);
    await new Promise(resolve => setTimeout(resolve, timeoutMs));
  }
}
