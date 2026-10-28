import Browser from "webextension-polyfill";

export const LANGUAGES = {
  en: "English",
  pt_br: "Português (Brasil)",
  es: "Español",
  fr: "Français",
  ru: "Русский"
};

export type LanguageCode = keyof typeof LANGUAGES;

/** Id of the flag drawing in public/ui.svg for each language ("flag-<id>"). */
export const LANGUAGE_FLAGS: Record<LanguageCode, string> = {
  en: "flag-us",
  pt_br: "flag-br",
  es: "flag-es",
  fr: "flag-fr",
  ru: "flag-ru"
};

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(LANGUAGES, value);
}

/**
 * Maps a browser language tag ("pt-BR", "fr-CA", "es-419", "ru") to a supported
 * language, or English when there is none. Any Portuguese goes to pt_br.
 */
export function resolveLanguage(tag: string | undefined | null): LanguageCode {
  const normalized = String(tag ?? "").toLowerCase().replace("-", "_");
  if (isLanguageCode(normalized)) return normalized;
  const base = normalized.split("_")[0];
  if (base === "pt") return "pt_br";
  return isLanguageCode(base) ? base : "en";
}

let messagesCache: Record<string, Record<string, { message: string }>> = {};
let currentLanguageCode: LanguageCode | null = null;

/**
 * Language to save when the extension updates, or null to keep the saved one.
 * Up to 0.8.x only English and Portuguese existed, so a browser in Spanish,
 * French or Russian got "en" saved on install. Those users move to their
 * browser's language once, on the update that added it.
 */
export function languageAfterUpdate(
  previousVersion: string | undefined,
  savedLanguage: unknown,
  uiLanguage: string | undefined
): LanguageCode | null {
  if (!previousVersion || savedLanguage !== "en") return null;
  const [major = 0, minor = 0] = previousVersion.split(".").map((part) => parseInt(part, 10) || 0);
  if (major > 0 || minor >= 9) return null;
  const browserLanguage = resolveLanguage(uiLanguage);
  return browserLanguage === "es" || browserLanguage === "fr" || browserLanguage === "ru" ? browserLanguage : null;
}

/**
 * Get the current language from storage or default to browser UI language
 */
export async function getCurrentLanguage(): Promise<LanguageCode> {
  try {
    const result = await Browser.storage.local.get("language") as { language?: unknown };
    // Older versions saved "pt_BR" on install; resolveLanguage maps it to "pt_br".
    if (typeof result.language === "string" && result.language) return resolveLanguage(result.language);
    return resolveLanguage(Browser.i18n.getUILanguage());
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
      const response = await fetch(Browser.runtime.getURL(`_locales/${lang.toLowerCase()}/messages.json`));
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