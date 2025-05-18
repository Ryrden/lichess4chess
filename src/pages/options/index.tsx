import React from 'react';
import { createRoot } from 'react-dom/client';
import Options from '@pages/options/Options';
import '@pages/options/index.css';
import { loadLanguageMessages, getCurrentLanguage } from '@src/utils/i18n';

async function init() {
  // Make sure we load the language messages before rendering
  const lang = await getCurrentLanguage();
  await loadLanguageMessages(lang);
  
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Options root element");
  const root = createRoot(rootContainer);
  root.render(<Options />);
}

init();
