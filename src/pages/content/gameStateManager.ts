import Browser from 'webextension-polyfill';
import { GAME_STATE, GameState } from './types';
import { detectGameState, getCurrentGamePgn } from './gameState';
import { getMessage } from '@src/utils/i18n';
import { getSettings } from '@src/utils/settings';
import axios from 'axios';

let currentState: GameState = GAME_STATE.NOT_CHESS_SITE;
let observer: MutationObserver | null = null;

const applyUserOptions = async (state: GameState): Promise<void> => {
  const settings = await getSettings();

  if (state.type === GAME_STATE.GAME_FINISHED.type) {
    if (settings.autoOpenLichess) {
      openLichessAnalysis().catch(err => console.error('Error opening Lichess:', err));
    }
    // injectLichessButton internally respects the injectGoToLichessButton setting
    injectLichessButton();
  }
};

const updateState = (newState: GameState): void => {
  if (newState.type !== currentState.type) {
    currentState = newState;

    // Apply user options (auto-open and conditional button injection)
    applyUserOptions(currentState);

    Browser.runtime.sendMessage({
      action: 'updateGameState',
      state: currentState
    }).catch(err => console.log('Error sending state update:', err));
  }
};

export const checkAndUpdateState = (): GameState => {
  const newState = detectGameState();
  updateState(newState);
  if (
    currentState.type === GAME_STATE.GAME_FINISHED.type &&
    findReviewButtons().some((button) => !button.parentElement?.querySelector('.lichess4chess-review-button'))
  ) {
    injectLichessButton();
  }
  return currentState;
};

export const initStateObserver = (): void => {
  if (observer) {
    observer.disconnect();
  }
  
  checkAndUpdateState();
  
  observer = new MutationObserver(() => {
    checkAndUpdateState();
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
};

export const getCurrentState = (): GameState => {
  checkAndUpdateState();
  return { ...currentState };
};

export const openLichessAnalysis = async () => {
  const pgn = await getCurrentGamePgn();
  if (!pgn) {
    throw new Error("Could not get the PGN of this game, so nothing was sent to Lichess");
  }
  const response = await axios.post("https://lichess.org/api/import", {
    pgn: pgn,
  });
  if (response.status === 200) {
    const url = response.data.url;
    if (!url) {
      throw new Error("No analysis URL returned from Lichess");
    }

    window.open(url, "_blank");
  } else{
    console.error("Error opening Lichess analysis:", response.statusText);
    throw new Error("Failed to open Lichess analysis");
  }
};

// Chess.com's "Game Review" buttons (game-over modal and sidebar). Class names
// on chess.com carry generated suffixes that change between releases, so match
// on stable attributes first and keep the old class as a fallback.
// [data-variant] keeps it to real buttons: the "2 Great / 4 Best" summary is a
// review link too, and the label text changes with the chess.com language.
const REVIEW_BUTTON_SELECTORS = [
  'a[href*="tab=review"][data-variant]',
  'a[aria-label="Game Review"][data-variant]',
  '.game-over-review-button-game-over-review-button',
];

export const findReviewButtons = (root: ParentNode = document): HTMLElement[] => {
  const found = new Set<HTMLElement>();
  for (const selector of REVIEW_BUTTON_SELECTORS) {
    root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      if (!element.classList.contains('lichess4chess-review-button')) found.add(element);
    });
  }
  return [...found];
};

const MAX_INJECT_ATTEMPTS = 20;
let injectAttempts = 0;

const injectLichessButton = async (): Promise<void> => {
  const settings = await getSettings();
  if (!settings.injectGoToLichessButton) {
    return;
  }

  const reviewButtons = findReviewButtons();
  if (reviewButtons.length === 0) {
    // The game-over UI may still be rendering: retry a few times, then give up
    // (the state observer calls this again when the page changes).
    if (injectAttempts++ < MAX_INJECT_ATTEMPTS) {
      setTimeout(injectLichessButton, 1000);
    }
    return;
  }
  injectAttempts = 0;

  for (const reviewButton of reviewButtons) {
    const container = reviewButton.parentElement;
    if (!container || container.querySelector('.lichess4chess-review-button')) {
      continue;
    }

    const lichessButton = document.createElement('a');
    // Reuse chess.com's own button classes so ours matches the "Game Review" look.
    lichessButton.className = `${reviewButton.className} lichess4chess-review-button`;
    lichessButton.textContent = getMessage('goToLichessReview');
    lichessButton.href = '#';
    lichessButton.setAttribute('role', 'button');

    lichessButton.addEventListener('click', (e) => {
      e.preventDefault();
      openLichessAnalysis().catch(err => console.error('Error opening Lichess:', err));
    });

    reviewButton.insertAdjacentElement('afterend', lichessButton);
  }
};

const removeLichessButton = (): void => {
  const existingButton = document.querySelector('.lichess4chess-review-button');
  if (existingButton) {
    existingButton.remove();
  }
};

export const cleanup = (): void => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  removeLichessButton();
};
