import Browser from "webextension-polyfill";

console.log('background script loaded');

interface SwitchLanguageMessage {
  action: string;
  language: string;
}

/**
 * Initial setup: Use browser language if not already set
 */
Browser.runtime.onInstalled.addListener(async () => {
  const { language } = await Browser.storage.local.get("language");
  if (!language) {
    const browserLanguage = Browser.i18n.getUILanguage().split('-')[0];
    const defaultLanguage = ['en', 'pt'].includes(browserLanguage) ? 
      (browserLanguage === 'pt' ? 'pt_BR' : browserLanguage) : 'en';
    
    await Browser.storage.local.set({ language: defaultLanguage });
  }
});

/**
 * Language change handler
 * - Stores selected language
 * - Notifies all extension parts about the change
 */
Browser.runtime.onMessage.addListener(async (message: SwitchLanguageMessage, sender: any) => {
  if (message.action === "switchLanguage") {
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
});
