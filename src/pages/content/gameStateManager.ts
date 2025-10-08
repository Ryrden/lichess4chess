import Browser from 'webextension-polyfill';
import { GAME_STATE, GameState } from './types';
import { detectGameState, getCurrentGamePgn } from './gameState';
import { getMessage } from '@src/utils/i18n';
import axios from 'axios';

let currentState: GameState = GAME_STATE.NOT_CHESS_SITE;
let observer: MutationObserver | null = null;

const updateState = (newState: GameState): void => {
  if (newState.type !== currentState.type) {
    currentState = newState;

    if (newState.type === GAME_STATE.GAME_FINISHED.type) {
      injectLichessButton();
    }

    Browser.runtime.sendMessage({
      action: 'updateGameState',
      state: currentState
    }).catch(err => console.log('Error sending state update:', err));
  }
};

export const checkAndUpdateState = (): GameState => {
  const newState = detectGameState();
  updateState(newState);
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
  const response = await axios.post("https://lichess.org/api/import", {
    pgn: pgn,
  });
  if (response.status === 200) {
    const url = response.data.url;
    window.open(url, "_blank");
  }else{
    console.error("Error opening Lichess analysis:", response.statusText);
    throw new Error("Failed to open Lichess analysis");
  }
};

const injectLichessButton = (): void => {
  if (document.querySelector('.lichess4chess-review-button')) {
    return;
  }

  const reviewButton = document.querySelector('.game-over-review-button-game-over-review-button');
  if (!reviewButton) {
    setTimeout(injectLichessButton, 1000);
    return;
  }

  const buttonContainer = reviewButton.parentElement;
  if (!buttonContainer) {
    return;
  }

  const lichessButton = document.createElement('a');
  lichessButton.className = 'cc-button-component cc-button-primary cc-button-xx-large cc-bg-primary cc-button-full game-over-review-button-game-over-review-button lichess4chess-review-button';
  lichessButton.textContent = getMessage('goToLichessReview');
  lichessButton.href = '#';

  lichessButton.addEventListener('click', (e) => {
    e.preventDefault();
    openLichessAnalysis().catch(err => console.error('Error opening Lichess:', err));
  });

  buttonContainer.appendChild(lichessButton);
};

export const cleanup = (): void => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};