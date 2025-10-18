import Browser from "webextension-polyfill";

console.log('background script loaded');

interface ExtensionMessage {
  action: string;
  language?: string;
  settings?: Record<string, any>;
}

/**
 * Default settings
 */
const defaultSettings = {
  language: 'en',
  theme: 'system',
  // notifications: true, // TODO: TDB
  autoOpenLichess: false,
  injectGoToLichessButton: true,
};

/**
 * Initial setup: Set default settings if not already set
 */
Browser.runtime.onInstalled.addListener(async () => {
  const result = await Browser.storage.local.get([
    'language',
    'theme',
    // 'notifications', // TODO: TDB
    'autoOpenLichess',
    'injectGoToLichessButton'
  ]);
  
  const settingsToSet: Record<string, any> = {};
  
  if (!result.language) {
    const browserLanguage = Browser.i18n.getUILanguage().split('-')[0];
    const defaultLanguage = ['en', 'pt'].includes(browserLanguage) ? 
      (browserLanguage === 'pt' ? 'pt_BR' : browserLanguage) : 'en';
    
    settingsToSet.language = defaultLanguage;
  }
  
  if (result.theme === undefined) {
    settingsToSet.theme = defaultSettings.theme;
  }
  
  // if (result.notifications === undefined) {
  //   settingsToSet.notifications = defaultSettings.notifications;
  // }
  
  if (result.autoOpenLichess === undefined) {
    settingsToSet.autoOpenLichess = defaultSettings.autoOpenLichess;
  }
  
  if (result.injectGoToLichessButton === undefined) {
    settingsToSet.injectGoToLichessButton = defaultSettings.injectGoToLichessButton;
  }
  
  if (Object.keys(settingsToSet).length > 0) {
    await Browser.storage.local.set(settingsToSet);
  }
  
});

/**
 * Message handlers for extension communication
 */
Browser.runtime.onMessage.addListener(async (message: ExtensionMessage, sender: any) => {
  // Language change handler
  if (message.action === "switchLanguage" && message.language) {
    await Browser.storage.local.set({ language: message.language });
    
    const tabs = await Browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        Browser.tabs.sendMessage(tab.id, { 
          action: "languageChanged", 
          language: message.language 
        }).catch(() => {/* Ignore errors */});
      }
    }
    
    return { success: true };
  }
  
  // Settings change handler
  if (message.action === "settingsChanged" && message.settings) {
    // Store the settings
    await Browser.storage.local.set(message.settings);
    
    // Notify all tabs about the settings change
    const tabs = await Browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        Browser.tabs.sendMessage(tab.id, { 
          action: "settingsChanged", 
          settings: message.settings 
        }).catch(() => {/* Ignore errors */});
      }
    }
    
    return { success: true };
  }
});
