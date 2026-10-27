import { GAME_STATE, GameState } from "./types";
import { tryOrNull } from "../../utils/errorHandling";
import { clickElement, delay, extractGameIdFromUrl, findTargetGame } from "../../utils/domUtils";

export const isChessSite = (): boolean => {
  return window.location.hostname.includes("chess.com");
};

export const isGameInProgress = (): boolean => {
  return (
    !!document.querySelector(".board-modal-container .clock-component") &&
    !document.querySelector(".board-layout-evaluation") &&
    !isGameFinished()
  );
};

export const isGameFinished = (): boolean => {
  return (
    !!document.querySelector(".game-over-modal-content") ||
    !!document.querySelector(".game-over-modal-shell-container") ||
    !!document.querySelector(".game-over-modal") ||
    !!document.querySelector("[aria-label='Share']") ||
    !!document.querySelector(".game-result")
  );
};

export const detectGameState = (): GameState => {
  if (!isChessSite()) {
    return GAME_STATE.NOT_CHESS_SITE;
  }

  if (isGameFinished()) {
    return GAME_STATE.GAME_FINISHED;
  }

  if (isGameInProgress()) {
    return GAME_STATE.GAME_IN_PROGRESS;
  }

  return GAME_STATE.NO_GAME_DETECTED;
};

/** "YYYY/MM" for this month and the previous one (a game may have ended last month). */
function recentArchiveMonths(now: Date = new Date()): string[] {
  const months: string[] = [];
  for (let offset = 0; offset < 2; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push(`${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

async function fetchPlayerGames(username: string, yearMonth: string): Promise<any[]> {
  const apiUrl = `https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/games/${yearMonth}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Chess.com API request failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return Array.isArray(data.games) ? data.games : [];
}

export const getCurrentGamePgnAPI = async (): Promise<string | null> => {
  const gameId = extractGameIdFromUrl();
  if (!gameId) {
    throw new Error(`Could not find a game ID in the URL (${window.location.pathname})`);
  }

  // Look in both players' archives (the current user's games may be private
  // to the API until the archive updates), this month first, then last month.
  const { currentUser, opponentUser, otherUser } = getPlayerUsernames();
  const players = [...new Set([opponentUser, otherUser, currentUser].filter((name): name is string => !!name))];

  for (const yearMonth of recentArchiveMonths()) {
    for (const player of players) {
      const games = await tryOrNull(() => fetchPlayerGames(player, yearMonth), `archive ${player} ${yearMonth}`);
      const targetGame = games ? findTargetGame(games, gameId) : null;
      if (targetGame?.pgn) return targetGame.pgn;
    }
  }

  throw new Error(`Game ${gameId} was not found in the players' recent archives`);
};



function getPlayerUsernames(): { currentUser: string | null; opponentUser: string; otherUser: string } {
  const usernameElements = document.querySelectorAll('[data-test-element="user-tagline-username"]');
  
  if (usernameElements.length < 2) {
    throw new Error("Could not find both player usernames on the page");
  }
  
  const username1 = usernameElements[0].textContent?.trim();
  const username2 = usernameElements[1].textContent?.trim();
  
  if (!username1 || !username2) {
    throw new Error("Player usernames are empty or invalid");
  }
  
  const currentUser = document.querySelector('#notifications-request[username]')?.getAttribute('username') || null;
  
  // Determine opponent (if we know current user, pick the other one)
  const opponentUser = currentUser && username1.toLowerCase() === currentUser.toLowerCase() 
    ? username2 
    : username1;
  const otherUser = opponentUser === username1 ? username2 : username1;
  
  return { currentUser, opponentUser, otherUser };
}





export const getCurrentGamePgnManual = async (): Promise<string | null> => { 
  await clickElement("[aria-label='Share']", "Share button not found");
  await delay(1500);
  
  await clickElement("#tab-pgn", "PGN tab not found in share modal");
  await delay(500);
  
  const pgnElement = document.querySelector(".share-menu-tab-pgn-textarea") as HTMLTextAreaElement;
  if (!pgnElement) {
    throw new Error("PGN textarea not found or not loaded");
  }
  
  const pgn = pgnElement.value.trim();
  if (!pgn) {
    throw new Error("PGN content is empty");
  }
  
  const closeButton = document.querySelector(".cc-modal-header-close");
  if (closeButton) {
    (closeButton as HTMLElement).click();
  }
  
  return pgn;
};



export const getCurrentGamePgn = async (): Promise<string | null> => {
  const apiResult = await tryOrNull(getCurrentGamePgnAPI, 'API method');
  if (apiResult) return apiResult;

  const manualResult = await tryOrNull(getCurrentGamePgnManual, 'Manual method');
  return manualResult;
};

