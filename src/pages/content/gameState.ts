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

export const getCurrentGamePgn = async (): Promise<string | null> => { 
  const shareButton = document.querySelector("[aria-label='Share']");
  if (!shareButton) {
    throw new Error("Share button not found");
  }

  // Hide modal with CSS injection
  const style = document.createElement('style');
  style.textContent = `
    #share-modal, .cc-modal-component, .cc-modal-backdrop,
    .cc-modal-body, .cc-modal-header-component,
    .share-menu-modal-header, .share-menu-share-link-component,
    .cc-tab-group-component, .share-menu-content,
    .cc-modal, .modal, [role='dialog'], 
    [class*="modal"], [class*="share"] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  (shareButton as HTMLElement).click();

  const hideModal = () => {
    const selectors = [
      '#share-modal', '.cc-modal-component', '.cc-modal-backdrop',
      '.cc-modal-body', '.cc-modal-header-component',
      '.share-menu-modal-header', '.share-menu-share-link-component',
      '.cc-tab-group-component', '.share-menu-content',
      '.cc-modal', '.modal', '[role="dialog"]', '[class*="modal"]', '[class*="share"]'
    ];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    });
  };

  
  setTimeout(hideModal, 0);

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

  // Clean up
  document.head.removeChild(style);

  return pgn;
};