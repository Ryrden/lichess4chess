import Browser from "webextension-polyfill";

console.log('background script loaded');

// Message type definition
interface SwitchLanguageMessage {
  action: string;
  language: string;
}

// Set up a listener for language changes
Browser.runtime.onInstalled.addListener(async () => {
  // Check if language is set, otherwise set default language
  const { language } = await Browser.storage.local.get("language");
  if (!language) {
    // Get browser UI language or default to English
    const browserLanguage = Browser.i18n.getUILanguage().split('-')[0];
    const defaultLanguage = ['en', 'pt'].includes(browserLanguage) ? 
      (browserLanguage === 'pt' ? 'pt_BR' : browserLanguage) : 'en';
    
    await Browser.storage.local.set({ language: defaultLanguage });
  }
});

// Handle messages
Browser.runtime.onMessage.addListener(async (message: SwitchLanguageMessage, sender: any) => {
  if (message.action === "switchLanguage") {
    await Browser.storage.local.set({ language: message.language });
    
    // Notify all tabs about the language change
    const tabs = await Browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await Browser.tabs.sendMessage(tab.id, { 
            action: "languageChanged", 
            language: message.language 
          }).catch(() => {
            // Ignore errors for tabs that don't have content scripts
          });
        } catch (e) {
          // Ignore errors for tabs that don't have listeners
        }
      }
    }
    
    // If the message came from options page or content script (not popup)
    // we need to reload all extension pages
    if (sender.tab) {
      Browser.runtime.reload();
    }
    
    return { success: true };
  }
});
