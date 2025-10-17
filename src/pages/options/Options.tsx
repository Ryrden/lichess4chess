import { useState, useEffect } from 'react';
import Browser from 'webextension-polyfill';
import LanguageSwitcher from '@src/components/LanguageSwitcher';
import { getMessage } from '@src/utils/i18n';
import { Settings, ThemeOption, defaultSettings, getSettings, saveSettings, resetSettings as resetAllSettings, applyTheme } from '@src/utils/settings';
import GameOverImg from '../../assets/GameOverImg.png';
import PopupImg from '../../assets/PopupImg.png';
import './options.css';
// ...existing code...
export default function Options() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSaved, setIsSaved] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [extensionVersion, setExtensionVersion] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
      
      applyTheme(currentSettings.theme);
      
      const manifestData = Browser.runtime.getManifest();
      setExtensionVersion(manifestData.version || '');
    };

    fetchSettings();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  // Mount indicator for easier debugging in the options page
  useEffect(() => {
    console.log('Lichess4Chess Options mounted');
  }, []);

  // Auto-scroll to and briefly highlight the How To Use section to make it visible
  useEffect(() => {
    const el = document.getElementById('how-to-use');
    if (el) {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('howto-highlight');
        setTimeout(() => el.classList.remove('howto-highlight'), 4000);
      } catch (err) {
        // ignore
      }
    }
  }, []);
  
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);
  
  const handleSaveSettings = async () => {
    await saveSettings({
      theme: settings.theme,
      notifications: settings.notifications,
      autoOpenLichess: settings.autoOpenLichess,
    });
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };
  
  const handleResetSettings = async () => {
    const newSettings = { ...defaultSettings };
    setSettings(newSettings);
    await resetAllSettings();
    
    setIsReset(true);
    setTimeout(() => {
      setIsReset(false);
    }, 3000);
  };
  
  const handleToggle = (key: keyof Settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings({
        ...settings,
        [key]: !settings[key],
      });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img
            src={Browser.runtime.getURL('original.png')}
            alt="Lichess4Chess Logo"
            className="h-16 w-16 mr-4"
          />
          <h1 className="text-2xl font-bold text-green-600">Lichess4Chess</h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">{getMessage("optionsTitle")}</h2>
      </header>
      
      <main className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* {How to Use Guide} */}
  <section id="how-to-use" className="mb-8 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">How To Use</h3>
          <ol className="steps">
            <li>Play a game on <a href="https://www.chess.com/home">Chess.com</a></li>
            <li>When the game ends, click <strong>Go to Lichess Review</strong> in the game over dialog.</li>
            <li>Or open the extension popup and use <strong>Open Lichess</strong> or <strong>Copy PGN</strong>.</li>
            <li>If import fails, paste the PGN at <a href="https://lichess.org/import" target="_blank" rel="noreferrer">lichess.org/import</a>.</li>
          </ol>
          <div className="image1">
            <figure className="gamoverimg">
              <img src={GameOverImg} alt="Game over dialog showing Go to Lichess Review" className="rounded shadow-sm"></img>
              <figcaption className="cap1">Click the Go to Lichess Review button after a finished game.</figcaption>
            </figure>
            <figure className="imag2">
              <figure className="popupimg">
                <img src={PopupImg} alt="Extension popup with Open Lichess and Copy PGN actions" className="rounded shadow-sm"></img>
                <figcaption className="text-sm text-gray-800 mt-2">Use quick actions from the popup.</figcaption>
              </figure>
            </figure>
          </div>
        </section>

        {/* Language Settings */}
        <section className="mb-8 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{getMessage("languageSettings")}</h3>
          <p className="text-gray-600 mb-4">{getMessage("languageSettingsDesc")}</p>
          
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </section>
        
        {/* Appearance Settings */}
        <section className="mb-8 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{getMessage("appearanceSettings")}</h3>
          <div className="mt-4">
            <label className="block text-gray-700 mb-2">{getMessage("themeSetting")}</label>
            <div className="flex flex-wrap gap-4">
              {(['light', 'dark', 'system'] as ThemeOption[]).map((theme) => (
                <div 
                  key={theme}
                  className={`
                    px-4 py-2 border rounded-md cursor-pointer
                    ${settings.theme === theme 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-300 hover:border-gray-400'}
                  `}
                  onClick={() => setSettings({ ...settings, theme })}
                >
                  {getMessage(`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`)}
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features to be added */}
        <section className="mb-8 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{getMessage("featuresToBeAdded")}</h3>
          {/* Aqui vou adicionar um texto apenas dizendo q estou trabalhando em features para tornar o uso da extensão melhor ainda, por exemplo permitir abrir o lichess automagicamente apos o final da partida ou um botao de revisao na tela ao inves de apenas an extensao. */}
          <p className="text-gray-600">{getMessage("featuresToBeAddedDesc")}</p>
        </section>

        {/* Analysis Settings */}
        {/* <section className="mb-8 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{getMessage("analysisSettings")}</h3>
          <div className="flex items-center mb-4">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.autoOpenLichess}
                  onChange={() => handleToggle('autoOpenLichess')}
                />                <div className={`block w-14 h-8 rounded-full ${settings.autoOpenLichess ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${settings.autoOpenLichess ? 'transform translate-x-6' : ''}`}></div>
              </div>
              <div className="ml-3 text-gray-700 font-medium">{getMessage("autoOpenLichess")}</div>
            </label>
          </div>
          <p className="text-gray-600">{getMessage("autoOpenDesc")}</p>
        </section> */}
        
        {/* About Section */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{getMessage("aboutSection")}</h3>
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">{getMessage("versionInfo")}:</span>
            <span className="text-gray-600">{extensionVersion}</span>
          </div>
          <p className="text-gray-600">{getMessage("aboutDesc")}</p>
          <div className="mt-4">
            <a 
              href="https://chromewebstore.google.com/detail/lichess4chess/jenelhcabimbmbhoeejapoapolemplop/reviews" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {getMessage("rateExtension")}
            </a>
          </div>
          {/* Adicionar uma div igual a de cima mas que vai levar para o github para abrir uma issue, o texto deve ser tipo "Tem uma sugestão de feature? Abra uma issue no github :) ficarei feliz de implementa-la" */}
          <div className="mt-4">
            <a 
              href="https://github.com/ryrden/lichess4chess/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {getMessage("suggestFeature")}
            </a>
          </div>
        </section>
          {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-8">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {getMessage("saveSettings")}
          </button>
          
          <button
            onClick={handleResetSettings}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {getMessage("resetSettings")}
          </button>
        </div>
          {/* Notification Messages */}
        {isSaved && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded animate-fade-in">
            {getMessage("settingsSaved")}
          </div>
        )}
        
        {isReset && (
          <div className="mt-4 p-2 bg-blue-100 text-blue-700 rounded animate-fade-in">
            {getMessage("settingsReset")}
          </div>
        )}
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Lichess4Chess</p>
      </footer>
    </div>
  );
}
