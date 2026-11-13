import Browser from 'webextension-polyfill';
import { getCurrentState, initStateObserver, openLichessAnalysis } from './gameStateManager';
import { loadLanguageMessages, getCurrentLanguage } from '@src/utils/i18n';
import { initializeGameSelectorUI } from '@src/service/ui';
import { isLichess } from '@src/service/pageDetection';
import { showReviewPromptIfDue } from '@src/service/reviewPromptCard';
import './style.css';
import { getSettings } from '@src/utils/settings';

const initialize = async (): Promise<void> => {
  // Register message listener FIRST - critical for popup communication
  Browser.runtime.onMessage.addListener((message: any, sender: any) => {
    switch (message.action) {
      case 'getGameState':
        const state = getCurrentState();
        console.log('📤 Popup requested game state, responding with:', state);
        return Promise.resolve({ state });
      
      case 'openLichessAnalysis':
        return openLichessAnalysis();
      
      case 'settingsChanged':
        console.log('Settings changed, will apply on next state check');
        return Promise.resolve({ success: true });
      
      default:
        return false;
    }
  });
  
  // Initialize state observer synchronously
  initStateObserver();
  
  // Initialize i18n system (async)
  const lang = await getCurrentLanguage();
  await loadLanguageMessages(lang);
  
  // Initialize game selector UI
  initializeGameSelectorUI();

  // A game just sent from Chess.com opens in a new Lichess tab: show the
  // store review card there if that use made it due.
  if (isLichess()) {
    showReviewPromptIfDue();
  }

  Browser.runtime.sendMessage({
    action: 'contentScriptReady'
  }).catch(err => console.log('Failed to notify extension about ready state:', err));
};

initialize();
console.log('Lichess4Chess: Content script loaded and initialized.');