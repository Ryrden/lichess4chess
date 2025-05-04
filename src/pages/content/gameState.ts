import Browser from "webextension-polyfill";
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

export const getCurrentGamePgn = async (): Promise<string | null> => {
  const shareButton = document.querySelector(".share");
  if (!shareButton) {
    throw new Error("Botão de compartilhamento não encontrado");
  }

  (shareButton as HTMLElement).click();

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const pgnTab = document.querySelector("#tab-pgn");
  if (!pgnTab) {
    throw new Error("Aba PGN não encontrada");
  }

  (pgnTab as HTMLElement).click();

  await new Promise((resolve) => setTimeout(resolve, 500));

  const pgnElement = document.querySelector(".share-menu-tab-pgn-textarea");
  if (!pgnElement) {
    throw new Error("Área de texto PGN não encontrada");
  }

  const pgn = (pgnElement as HTMLTextAreaElement).value;

  const closeButton = document.querySelector(".cc-modal-header-close");
  if (closeButton) {
    (closeButton as HTMLElement).click();
  }

  return pgn;
};
