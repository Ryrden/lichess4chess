import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/popup/index.css';
import '@assets/styles/tailwind.css';
import Popup from '@pages/popup/Popup';
import { loadLanguageMessages, getCurrentLanguage } from '@src/utils/i18n';

/**
 * Initialize the popup
 * Ensures language messages are loaded before rendering anything
 */
async function init() {
  const lang = await getCurrentLanguage();
  await loadLanguageMessages(lang);
  
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(<Popup />);
}

init();
