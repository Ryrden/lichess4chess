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
    !!document.querySelector(".share")
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

export const getCurrentGamePgn = async (): Promise<string | null> => {  const shareButton = document.querySelector(".share");
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
