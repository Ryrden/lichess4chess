import Browser from 'webextension-polyfill';
import { getCurrentState, initStateObserver, openLichessAnalysis } from './gameStateManager';
import { loadLanguageMessages, getCurrentLanguage } from '@src/utils/i18n';
import { initializeGameSelectorUI } from '@src/service/ui';
import './style.css';

const initialize = async (): Promise<void> => {
  // Initialize i18n system
  const lang = await getCurrentLanguage();
  await loadLanguageMessages(lang);
  
  initStateObserver();
  initializeGameSelectorUI();
  
  Browser.runtime.onMessage.addListener((message: any, sender: any) => {
    switch (message.action) {
      case 'getGameState':
        return Promise.resolve({ state: getCurrentState() });
      
      case 'openLichessAnalysis':
        return openLichessAnalysis();
      
      default:
        return false;
    }
  });
  
  Browser.runtime.sendMessage({
    action: 'contentScriptReady'
  }).catch(err => console.log('Failed to notify extension about ready state:', err));
};

initialize();
console.log('Lichess4Chess: Content script loaded and initialized.');