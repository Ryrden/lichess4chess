import { useState, useEffect } from 'react';
import Browser from 'webextension-polyfill';
import LanguageSwitcher from '@src/components/LanguageSwitcher';
import { getMessage, getCurrentLanguage, LanguageCode } from '@src/utils/i18n';
import '@pages/options/Options.css';

export default function Options() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  useEffect(() => {
    const fetchLanguage = async () => {
      const lang = await getCurrentLanguage();
      setCurrentLanguage(lang);
    };

    fetchLanguage();
  }, []);

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
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{getMessage("languageSettings")}</h3>
          <p className="text-gray-600 mb-4">{getMessage("languageSettingsDesc")}</p>
          
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </section>
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Lichess4Chess</p>
      </footer>
    </div>
  );
}
