import Browser from 'webextension-polyfill';
import { getCurrentState, initStateObserver, openLichessAnalysis } from './gameStateManager';
import { loadLanguageMessages, getCurrentLanguage } from '@src/utils/i18n';
import { getSettings } from '@src/utils/settings';

const initialize = async (): Promise<void> => {
  // Initialize i18n system
  const lang = await getCurrentLanguage();
  await loadLanguageMessages(lang);
  
  initStateObserver();
  
  Browser.runtime.onMessage.addListener((message: any, sender: any) => {
    switch (message.action) {
      case 'getGameState':
        return getCurrentState().then(state => ({ state }));
      
      case 'openLichessAnalysis':
        return openLichessAnalysis();
      
      case 'settingsChanged':
        // Handle settings changes - the game state manager will check settings on next state change
        console.log('Settings changed, will apply on next state check');
        return Promise.resolve({ success: true });
      
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