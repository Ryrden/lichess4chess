import Browser from 'webextension-polyfill';
import { LanguageCode, getCurrentLanguage } from './i18n';

export type ThemeOption = 'light' | 'dark' | 'system';

export interface Settings {
  language: LanguageCode;
  theme: ThemeOption;
  notifications: boolean;
  autoOpenLichess: boolean;
}

export const defaultSettings: Settings = {
  language: 'en',
  theme: 'system',
  notifications: true,
  autoOpenLichess: false,
};

/**
 * Get all settings from storage
 */
export async function getSettings(): Promise<Settings> {
  const lang = await getCurrentLanguage();
  
  const result = await Browser.storage.local.get([
    'theme', 
    'notifications', 
    'autoOpenLichess'
  ]);
  
  return {
    language: lang,
    theme: (result.theme as ThemeOption) || defaultSettings.theme,
    notifications: result.notifications !== undefined ? result.notifications : defaultSettings.notifications,
    autoOpenLichess: result.autoOpenLichess !== undefined ? result.autoOpenLichess : defaultSettings.autoOpenLichess,
  };
}

/**
 * Save all settings to storage
 */
export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  await Browser.storage.local.set(settings);
  
  // Notify all extension components about the settings change
  try {
    await Browser.runtime.sendMessage({
      action: 'settingsChanged',
      settings
    });
  } catch (error) {
    console.error('Error notifying about settings change:', error);
  }
}

/**
 * Reset settings to default values
 */
export async function resetSettings(): Promise<void> {
  await saveSettings(defaultSettings);
}

/**
 * Apply theme based on settings
 */
export function applyTheme(theme: ThemeOption): void {
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
