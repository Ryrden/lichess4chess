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

async function fetchPlayerGames(username: string): Promise<any[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const apiUrl = `https://api.chess.com/pub/player/${username}/games/${year}/${month}`;
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`Chess.com API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.games || data.games.length === 0) {
    throw new Error(`No games found for player '${username}' in ${year}/${month}`);
  }
  
  return data.games;
}

export const getCurrentGamePgnAPI = async (): Promise<string | null> => {
  const gameId = extractGameIdFromUrl();
  
  const { currentUser, opponentUser } = getPlayerUsernames();
  const games = await fetchPlayerGames(opponentUser);
  const targetGame = findTargetGame(games, gameId);
  
  if (!targetGame?.pgn) {
    throw new Error('Game found but no PGN data available');
  }
  
  return targetGame.pgn;
};



function getPlayerUsernames(): { currentUser: string | null; opponentUser: string } {
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
  
  return { currentUser, opponentUser };
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

