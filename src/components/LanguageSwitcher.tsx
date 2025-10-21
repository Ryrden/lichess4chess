import { useState, useEffect } from "react";
import Browser from "webextension-polyfill";
import { getCurrentLanguage, setLanguage, LanguageCode, LANGUAGES } from "../utils/i18n";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchLanguage = async () => {
      const lang = await getCurrentLanguage();
      setCurrentLanguage(lang);
    };
    fetchLanguage();
    
    const handleMessage = (message: any) => {
      if (message.action === "languageChanged" && message.language) {
        setCurrentLanguage(message.language as LanguageCode);
      }
    };
    Browser.runtime.onMessage.addListener(handleMessage);
    
    if (!document.querySelector('#ui-svg-sprites')) {
      fetch(Browser.runtime.getURL('ui.svg'))
        .then(response => response.text())
        .then(text => {
          const div = document.createElement('div');
          div.id = 'ui-svg-sprites';
          div.style.display = 'none';
          div.innerHTML = text;
          document.body.appendChild(div);
        })
        .catch(console.error);
    }
    
    return () => {
      Browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleLanguageChange = async (languageCode: LanguageCode) => {
    setCurrentLanguage(languageCode);
    setIsOpen(false);
    
    await Browser.storage.local.set({ language: languageCode });
    
    await setLanguage(languageCode);
  };
  
  const getFlagId = (langCode: LanguageCode) => {
    return langCode === 'pt_br' ? 'flag-br' : 'flag-us';
  };
  if (compact) {
    return (
      <div className="language-switcher relative">
        <button
          className="flex items-center focus:outline-none cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          title={LANGUAGES[currentLanguage]}
        >          <svg className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
            <use href={`#${getFlagId(currentLanguage)}`} />
          </svg>
        </button>
          {isOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-700 shadow-lg rounded-md py-1 z-10">
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <button
                key={code}
                className={`cursor-pointer flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 w-full ${currentLanguage === code ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                onClick={() => handleLanguageChange(code as LanguageCode)}
                title={name}
              >                <svg className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
                  <use href={`#${getFlagId(code as LanguageCode)}`} />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="language-switcher relative">      <button
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        title={LANGUAGES[currentLanguage]}
      >        <svg className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 mr-2">
          <use href={`#${getFlagId(currentLanguage)}`} />
        </svg>
        <span className="text-sm dark:text-gray-300">{LANGUAGES[currentLanguage]}</span>
        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
        {isOpen && (
        <div className="absolute top-full mt-1 bg-white dark:bg-gray-700 shadow-lg rounded-md py-1 z-10">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <button
              key={code}
              className={`flex items-center px-3 py-2 text-sm w-full text-left dark:text-gray-200 dark:hover:bg-gray-600  ${currentLanguage === code ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
              onClick={() => handleLanguageChange(code as LanguageCode)}
            >              <svg className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 mr-2">
              <use href={`#${getFlagId(code as LanguageCode)}`} />
              </svg>
              <span className={`dark:text-gray-200 ${currentLanguage === code ? 'text-black' : ''}`}>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
