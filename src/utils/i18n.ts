import Browser from "webextension-polyfill";

export const LANGUAGES = {
  en: "English",
  pt_BR: "Português (Brasil)"
};

export type LanguageCode = keyof typeof LANGUAGES;

let messagesCache: Record<string, Record<string, { message: string }>> = {};
let currentLanguageCode: LanguageCode | null = null;

/**
 * Get the current language from storage or default to browser UI language
 */
export async function getCurrentLanguage(): Promise<LanguageCode> {
  try {
    const result = await Browser.storage.local.get("language");
    return result.language || (Browser.i18n.getUILanguage().split('-')[0] as LanguageCode) || "en";
  } catch (error) {
    console.error("Error getting language:", error);
    return "en";
  }
}

/**
 * Load messages for a specific language
 */
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

/**
 * Switch language and notify all extension components
 */
export async function setLanguage(languageCode: LanguageCode): Promise<void> {
  try {
    await Browser.runtime.sendMessage({
      action: "switchLanguage",
      language: languageCode
    });
    
    window.location.reload();
  } catch (error) {
    console.error("Error setting language:", error);
  }
}

/**
 * Get a translated message string
 */
export function getMessage(key: string): string {
  if (currentLanguageCode && messagesCache[currentLanguageCode] && messagesCache[currentLanguageCode][key]) {
    return messagesCache[currentLanguageCode][key].message;
  }
  return Browser.i18n.getMessage(key) || key;
}