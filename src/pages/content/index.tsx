import Browser from 'webextension-polyfill';
import { getCurrentState, initStateObserver, openLichessAnalysis } from './gameStateManager';

const initialize = (): void => {
  initStateObserver();

  // Listen for messages from background or popup
  Browser.runtime.onMessage.addListener((message, sender) => {
    switch (message.action) {
      case 'getGameState':
        return Promise.resolve({ state: getCurrentState() });

      case 'openLichessAnalysis':
        // Only open Lichess if the toggle is ON
        return Browser.storage.local.get('showGoToLichess').then((result) => {
          const showButton = result.showGoToLichess ?? true; // default true
          if (showButton) {
            return openLichessAnalysis();
          } else {
            console.log('Go to Lichess button disabled by user.');
            return false;
          }
        });

      default:
        return false;
    }
  });

  // Notify background that content script is ready
  Browser.runtime.sendMessage({
    action: 'contentScriptReady'
  }).catch(err => console.log('Failed to notify extension about ready state:', err));
};

initialize();
console.log('Lichess4Chess: Content script loaded and initialized.');
