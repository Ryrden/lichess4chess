import React from 'react';
import { createRoot } from 'react-dom/client';
import '@assets/styles/tailwind.css';
import Popup from '@pages/popup/Popup';
import { loadLanguageMessages, getCurrentLanguage } from '@src/utils/i18n';
import { getSettings, applyTheme } from '@src/utils/settings';

/**
 * Initialize the popup
 * Ensures language messages are loaded before rendering anything
 */
async function init() {
  try {
    const lang = await getCurrentLanguage();
    await loadLanguageMessages(lang);
    
    // Apply theme settings
    const settings = await getSettings();
    applyTheme(settings.theme);
    
    const rootContainer = document.querySelector("#__root");
    if (!rootContainer) throw new Error("Can't find Popup root element");
    const root = createRoot(rootContainer);
    root.render(<Popup />);
  } catch (error) {
    console.error("Failed to initialize popup:", error);
  }
}

init();
