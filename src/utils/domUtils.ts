/**
 * Safely clicks an element by selector with error handling
 */
export async function clickElement(selector: string, errorMessage: string): Promise<void> {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(errorMessage);
  }
  (element as HTMLElement).click();
}

/**
 * Delays execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extracts game ID from chess.com URL
 */
export function extractGameIdFromUrl(): string | null {
  const gameIdMatch = window.location.href.match(/chess\.com\/(?:game\/live|live\/game)\/(\d+)/);
  return gameIdMatch ? gameIdMatch[1] : null;
}

/**
 * Finds a target game from a list, preferring specific gameId if provided
 */
export function findTargetGame(games: any[], gameId: string | null): any {
  if (gameId) {
    const specificGame = games.find(game => game.url && game.url.includes(gameId));
    if (specificGame) return specificGame;
  }
  
  // Fallback to the most recent game
  return games[games.length - 1];
}