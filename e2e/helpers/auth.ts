import { Page, BrowserContext } from '@playwright/test';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Get Chess.com auth config if available
 */
export async function getAuthConfig() {
  const authConfigPath = path.join(process.cwd(), 'e2e', 'auth.config.ts');
  
  if (existsSync(authConfigPath)) {
    try {
      const { authConfig } = await import('../auth.config');
      return authConfig;
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * Get a valid Chess.com game URL for testing
 * If authenticated, uses user's recent games
 * Otherwise, uses public archived games
 */
export async function getTestGameUrl(context: BrowserContext): Promise<string> {
  const auth = await getAuthConfig();
  
  if (auth?.username) {
    // User is authenticated - navigate to their recent games
    // The page will show their actual games
    const page = await context.newPage();
    await page.goto(`https://www.chess.com/games/archive/${auth.username}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Try to find a finished game link
    const gameLink = await page.locator('a[href*="/game/live/"]').first();
    
    if (await gameLink.count() > 0) {
      const href = await gameLink.getAttribute('href');
      await page.close();
      
      if (href) {
        return href.startsWith('http') 
          ? href 
          : `https://www.chess.com${href}`;
      }
    }
    
    await page.close();
  }
  
  // Fallback: Use a known public game URL
  // This is an older archived game that should be publicly accessible
  return 'https://www.chess.com/game/live/100000000000'; // Very old game ID
}

/**
 * Navigate to Chess.com homepage and check if logged in
 */
export async function isLoggedInToChessCom(page: Page): Promise<boolean> {
  await page.goto('https://www.chess.com');
  await page.waitForLoadState('domcontentloaded');
  
  // Check for login indicators
  const loggedIn = await page.locator('[data-username]').count() > 0;
  return loggedIn;
}

/**
 * Get user's Chess.com username from cookies/page
 */
export async function getChessComUsername(page: Page): Promise<string | null> {
  try {
    const usernameElement = await page.locator('[data-username]').first();
    if (await usernameElement.count() > 0) {
      const username = await usernameElement.getAttribute('data-username');
      return username;
    }
  } catch (error) {
    // Not logged in or element not found
  }
  
  // Try from auth config
  const auth = await getAuthConfig();
  return auth?.username || null;
}
