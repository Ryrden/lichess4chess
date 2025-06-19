import React from 'react';
import { createRoot } from 'react-dom/client';
import Options from '@pages/options/Options';
import { loadLanguageMessages, getCurrentLanguage } from '@src/utils/i18n';
import Browser from 'webextension-polyfill';

async function init() {
  try {
    const lang = await getCurrentLanguage();
    await loadLanguageMessages(lang);
    
    const rootContainer = document.querySelector("#__root");
    if (!rootContainer) throw new Error("Can't find Options root element");
    const root = createRoot(rootContainer);
    root.render(<Options />);
    
    document.title = Browser.i18n.getMessage("optionsTitle") || "Lichess4Chess Options";
  } catch (error) {
    console.error("Failed to initialize options page:", error);
    const rootContainer = document.querySelector("#__root");
    if (rootContainer) {
      rootContainer.innerHTML = `
        <div class="p-8 text-center">
          <h1 class="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p class="text-gray-700">Failed to load options page. Please try again later.</p>
        </div>
      `;
    }
  }
}

init();
