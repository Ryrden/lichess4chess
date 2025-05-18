import Browser from "webextension-polyfill";

// Available languages
export const LANGUAGES = {
  en: "English",
  pt_BR: "Português (Brasil)"
};

export type LanguageCode = keyof typeof LANGUAGES;

// Get the current language from storage or default to browser UI language
export async function getCurrentLanguage(): Promise<LanguageCode> {
  try {
    const result = await Browser.storage.local.get("language");
    return result.language || (Browser.i18n.getUILanguage().split('-')[0] as LanguageCode) || "en";
  } catch (error) {
    console.error("Error getting language:", error);
    return "en";
  }
}

// Set the language and store it
export async function setLanguage(languageCode: LanguageCode): Promise<void> {
  try {
    await Browser.storage.local.set({ language: languageCode });
    
    // Send a message to background script to handle language change
    await Browser.runtime.sendMessage({
      action: "switchLanguage",
      language: languageCode
    });
    
    // Reload the current page to apply changes immediately
    // For popup, this works better than runtime.reload() which is too aggressive
    window.location.reload();
  } catch (error) {
    console.error("Error setting language:", error);
  }
}

// Cache for messages to avoid excessive disk reads
let messagesCache: Record<string, Record<string, { message: string }>> = {};
let currentLanguageCode: LanguageCode | null = null;

// Load messages for a specific language
export async function loadLanguageMessages(lang: LanguageCode): Promise<void> {
  try {
    if (!messagesCache[lang]) {
      const response = await fetch(Browser.runtime.getURL(`_locales/${lang}/messages.json`));
      const messages = await response.json();
      messagesCache[lang] = messages;
    }
    currentLanguageCode = lang;
  } catch (error) {
    console.error(`Error loading messages for ${lang}:`, error);
  }
}

// Get message with language support
export async function getMessageAsync(key: string): Promise<string> {
  const lang = await getCurrentLanguage();
  
  // Load messages if needed
  if (!messagesCache[lang]) {
    await loadLanguageMessages(lang);
  }
  
  // Fall back to browser i18n if we couldn't load our custom messages
  if (!messagesCache[lang]) {
    return Browser.i18n.getMessage(key) || key;
  }
  
  return messagesCache[lang][key]?.message || Browser.i18n.getMessage(key) || key;
}

// Synchronous version that uses browser.i18n when custom messages aren't loaded yet
// This prevents UI flicker while waiting for async operations
export function getMessage(key: string): string {
  if (currentLanguageCode && messagesCache[currentLanguageCode] && messagesCache[currentLanguageCode][key]) {
    return messagesCache[currentLanguageCode][key].message;
  }
  return Browser.i18n.getMessage(key) || key;
}

// Initialize messages for current language
(async () => {
  const lang = await getCurrentLanguage();
  await loadLanguageMessages(lang);
})();