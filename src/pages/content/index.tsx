import Browser from 'webextension-polyfill';
import { getCurrentState, initStateObserver, openLichessAnalysis, getLichessAnalysisUrl } from './gameStateManager';

const initialize = (): void => {
  initStateObserver();
  
  Browser.runtime.onMessage.addListener((message, sender) => {
    switch (message.action) {
      case 'getGameState':
        return Promise.resolve({ state: getCurrentState() });
      
      case 'openLichessAnalysis':
        return openLichessAnalysis();
      
      case 'getLichessAnalysisUrl':
        return getLichessAnalysisUrl().then(url => ({ url })).catch(err => ({ error: String(err) }));
      
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