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
 * Extracts the numeric game ID from a chess.com game URL. Handles the formats
 * chess.com uses: /game/live/ID, /game/daily/ID, /game/ID, /live/game/ID,
 * /analysis/game/live/ID and /daily/game/ID (with or without a trailing path or query).
 */
export function extractGameIdFromUrl(href: string = window.location.href): string | null {
  let pathname: string;
  try {
    pathname = new URL(href).pathname;
  } catch {
    return null;
  }
  const match = pathname.match(/\/(?:game|live|daily)(?:\/(?:live|daily|game))?\/(\d+)(?:\/|$)/);
  return match ? match[1] : null;
}

/**
 * Finds the game with exactly this ID in a list of chess.com API games.
 * Returns null when it is not there: never guess another game.
 */
export function findTargetGame(games: any[], gameId: string): any | null {
  return (
    games.find((game) => {
      const url: unknown = game?.url;
      return typeof url === 'string' && url.replace(/\/+$/, '').split('/').pop() === gameId;
    }) ?? null
  );
}
