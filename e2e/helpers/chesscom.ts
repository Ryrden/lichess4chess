import { Page } from '@playwright/test';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Get user's Chess.com username from auth config if available
 */
async function getAuthUsername(): Promise<string | null> {
  const authConfigPath = path.join(process.cwd(), 'e2e', 'auth.config.ts');
  
  if (existsSync(authConfigPath)) {
    try {
      const { authConfig } = await import('../auth.config');
      return authConfig.username || null;
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * Test fixtures: Public Chess.com games from notable players
 * These games are publicly accessible without authentication
 * 
 * Note: Some game URLs may require login. Update these or use auth.config.ts
 */
export const TEST_GAMES = {
  // Public game from Magnus Carlsen - Archived game
  finishedRapid: {
    url: 'https://www.chess.com/game/live/115967698767', // Older public game
    username: 'MagnusCarlsen',
    expectedState: 'GAME_FINISHED',
  },
  
  // Profile page (no game detected)
  profilePage: {
    url: 'https://www.chess.com/member/MagnusCarlsen',
    username: 'MagnusCarlsen',
    expectedState: 'NO_GAME_DETECTED',
  },
};

/**
 * Wait for Chess.com page to fully load
 * Chess.com is a SPA, so we need to wait for dynamic content
 */
export async function waitForChessComPageLoad(page: Page) {
  // Wait for DOM to be ready (faster than networkidle)
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  
  // Wait a bit for SPA to render
  await page.waitForTimeout(3000);
}

/**
 * Navigate to a Chess.com game and wait for it to load
 */
export async function navigateToGame(page: Page, gameUrl: string) {
  await page.goto(gameUrl);
  await waitForChessComPageLoad(page);
}

/**
 * Check if we're on Chess.com
 */
export function isChessComUrl(url: string): boolean {
  return url.includes('chess.com');
}

/**
 * Check if we're on Lichess
 */
export function isLichessUrl(url: string): boolean {
  return url.includes('lichess.org');
}

/**
 * Wait for Lichess analysis page to load
 */
export async function waitForLichessAnalysisLoad(page: Page) {
  // Wait for the analysis board to be visible
  await page.waitForSelector('main.analyse', { timeout: 15000 });
  
  // Wait for board to render
  await page.waitForTimeout(2000);
}

/**
 * Extract the number of moves from Lichess analysis page
 * This helps verify that PGN was imported successfully
 */
export async function getLichessMoveCount(page: Page): Promise<number> {
  // Wait for move list to be present
  await page.waitForSelector('.moves', { timeout: 10000 });
  
  // Count move elements
  const moves = await page.locator('.moves move').count();
  return moves;
}

/**
 * Get public game URL for testing
 * These are real public games that don't require authentication
 */
export function getPublicGameUrl(gameType: keyof typeof TEST_GAMES): string {
  return TEST_GAMES[gameType].url;
}

/**
 * Get expected username for a test game
 */
export function getExpectedUsername(gameType: keyof typeof TEST_GAMES): string {
  return TEST_GAMES[gameType].username;
}
