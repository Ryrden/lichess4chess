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
      throw new Error("Could not find both player usernames on the page");
    }
    
    const username1 = usernameElements[0].textContent?.trim();
    const username2 = usernameElements[1].textContent?.trim();
    
    if (!username1 || !username2) {
      throw new Error("Could not extract usernames from elements");
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
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.games || data.games.length === 0) {
      throw new Error("No games found in API response");
    }
    
    let targetGame = null;
    if (gameId) {
      targetGame = data.games.find((game: any) => game.url && game.url.includes(gameId));
    }
    
    if (!targetGame) {
      targetGame = data.games[data.games.length - 1];
    }
    
    if (!targetGame.pgn) {
      throw new Error("No PGN found in the target game");
    }
    
    return targetGame.pgn;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get PGN from API: ${errorMessage}`);
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

export const getCurrentGamePgn = async (): Promise<string | null> => {
  try {
    const pgn = await getCurrentGamePgnAPI();
    return pgn;
  } catch (apiError) {
    try {
      const pgn = await getCurrentGamePgnManual();
      return pgn;
    } catch (manualError) {
      const apiErrorMsg = apiError instanceof Error ? apiError.message : String(apiError);
      const manualErrorMsg = manualError instanceof Error ? manualError.message : String(manualError);
      throw new Error(`Failed to get PGN. API error: ${apiErrorMsg}. Manual error: ${manualErrorMsg}`);
    }
  }
};

