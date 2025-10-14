import { GAME_STATE, GameState } from "./types";

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

export const getCurrentGamePgnAPI = async (): Promise<string | null> => {
  try {
    const url = window.location.href;
    const gameIdMatch = url.match(/chess\.com\/(?:game\/live|live\/game)\/(\d+)/);
    const gameId = gameIdMatch ? gameIdMatch[1] : null;
    
    const usernameElements = document.querySelectorAll('[data-test-element="user-tagline-username"]');
    
    if (usernameElements.length < 2) {
      return null;
    }
    
    const username1 = usernameElements[0].textContent?.trim();
    const username2 = usernameElements[1].textContent?.trim();
    
    if (!username1 || !username2) {
      return null;
    }
    

    let currentUsername = null;
    const notificationsElement = document.querySelector('#notifications-request[username]');
    if (notificationsElement) {
      currentUsername = notificationsElement.getAttribute('username');
    }
    
    let opponentUsername = username1;
    if (currentUsername && username1.toLowerCase() === currentUsername.toLowerCase()) {
      opponentUsername = username2;
    }
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const apiEndpoint = `https://api.chess.com/pub/player/${opponentUsername}/games/${currentYear}/${currentMonth}`;
    const response = await fetch(apiEndpoint);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.games || data.games.length === 0) {
      return null;
    }
    
    let targetGame = null;
    if (gameId) {
      targetGame = data.games.find((game: any) => game.url && game.url.includes(gameId));
    }
    
    if (!targetGame) {
      targetGame = data.games[data.games.length - 1];
    }
    
    if (!targetGame.pgn) {
      return null;
    }
    
    return targetGame.pgn;
  } catch (error) {
    return null;
  }
};

export const getCurrentGamePgnManual = async (): Promise<string | null> => { 
  const shareButton = document.querySelector("[aria-label='Share']");
  if (!shareButton) {
    throw new Error("Share button not found");
  }

  (shareButton as HTMLElement).click();

  await new Promise((resolve) => setTimeout(resolve, 1500));
  const pgnTab = document.querySelector("#tab-pgn");
  if (!pgnTab) {
    throw new Error("PGN tab not found");
  }

  (pgnTab as HTMLElement).click();

  await new Promise((resolve) => setTimeout(resolve, 500));
  const pgnElement = document.querySelector(".share-menu-tab-pgn-textarea");
  if (!pgnElement) {
    throw new Error("PGN textarea not found");
  }

  const pgn = (pgnElement as HTMLTextAreaElement).value;

  const closeButton = document.querySelector(".cc-modal-header-close");
  if (closeButton) {
    (closeButton as HTMLElement).click();
  }
  return pgn;
};

async function tryOrNull<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[fallback] ${fn.name} failed:`, err);
    return null;
  }
}

export const getCurrentGamePgn = async (): Promise<string | null> => {
  const apiResult = await tryOrNull(getCurrentGamePgnAPI);
  if (apiResult) return apiResult;

  const manualResult = await tryOrNull(getCurrentGamePgnManual);
  if (manualResult) return manualResult;

  return null;
};

