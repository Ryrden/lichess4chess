import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing of browser extension
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Extensions require isolated contexts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run tests sequentially to avoid extension conflicts
  reporter: [
    ['html'],
    ['list'],
  ],
  
  use: {
    // Base URL for Chess.com navigation
    baseURL: 'https://www.chess.com',
    
    // Collect trace on first retry
    trace: 'on-first-retry',
    
    // Screenshots on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Timeout for each action (click, fill, etc)
    actionTimeout: 15000,
    
    // Navigation timeout (Chess.com is slow)
    navigationTimeout: 45000,
  },

  projects: [
    {
      name: 'chromium-extension',
      use: { 
        ...devices['Desktop Chrome'],
        // Extension tests need headed mode for some features
        headless: false,
      },
    },
  ],

  // Global timeout for each test (Chess.com is slow to load)
  timeout: 90000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 15000,
  },
});
