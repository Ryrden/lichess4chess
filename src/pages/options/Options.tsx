import { useState, useEffect } from 'react';
import Browser from 'webextension-polyfill';
import LanguageSwitcher from '@src/components/LanguageSwitcher';
import { getMessage } from '@src/utils/i18n';
import { Settings, ThemeOption, defaultSettings, getSettings, saveSettings, resetSettings as resetAllSettings, applyTheme } from '@src/utils/settings';

export default function Options() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSaved, setIsSaved] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [extensionVersion, setExtensionVersion] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      // Get settings
      const currentSettings = await getSettings();
      setSettings(currentSettings);
      
      // Apply theme
      applyTheme(currentSettings.theme);
      
      // Get extension version
      const manifestData = Browser.runtime.getManifest();
      setExtensionVersion(manifestData.version || '');
    };

    fetchSettings();
    
    // Listen for system theme changes
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
  
  // Apply theme when it changes
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
        
        {/* Analysis Settings */}
        <section className="mb-8 pb-6 border-b border-gray-200">
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
        </section>
        
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
              href="https://chrome.google.com/webstore/detail/lichess4chess/your-extension-id" 
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
