import Browser from 'webextension-polyfill';
import { GAME_STATE, GameState } from './types';
import { detectGameState, getCurrentGamePgn } from './gameState';
import axios from 'axios';

let currentState: GameState = GAME_STATE.NOT_CHESS_SITE;
let observer: MutationObserver | null = null;

const updateState = (newState: GameState): void => {
  if (newState.type !== currentState.type) {
    currentState = newState;
    
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

export const cleanup = (): void => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};