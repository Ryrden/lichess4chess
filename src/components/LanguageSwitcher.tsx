import { useState, useEffect } from "react";
import Browser from "webextension-polyfill";
import { getCurrentLanguage, setLanguage, LanguageCode, LANGUAGES } from "../utils/i18n";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");
  const [isOpen, setIsOpen] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  useEffect(() => {
    const fetchLanguage = async () => {
      const lang = await getCurrentLanguage();
      setCurrentLanguage(lang);
    };

    fetchLanguage();
    
    // Listen for language changes from other parts of the extension
    const handleMessage = (message: any) => {
      if (message.action === "languageChanged" && message.language) {
        setCurrentLanguage(message.language as LanguageCode);
      }
    };
    
    Browser.runtime.onMessage.addListener(handleMessage);
    
    // Load SVG sprite once
    fetch(Browser.runtime.getURL('ui.svg'))
      .then(response => response.text())
      .then(text => {
        // Add SVG to the DOM once
        if (!document.querySelector('#ui-svg-sprites')) {
          const div = document.createElement('div');
          div.id = 'ui-svg-sprites';
          div.style.display = 'none';
          div.innerHTML = text;
          document.body.appendChild(div);
        }
        setSvgContent(text);
      })
      .catch(console.error);
      
    return () => {
      Browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);
  const handleLanguageChange = async (languageCode: LanguageCode) => {
    // First update the current language in the UI to provide immediate feedback
    setCurrentLanguage(languageCode);
    setIsOpen(false);
    
    // Then save the language preference
    await Browser.storage.local.set({ language: languageCode });
    
    // Reload the current page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 75);
  };
  
  const getFlagId = (langCode: LanguageCode) => {
    return langCode === 'pt_BR' ? 'flag-br' : 'flag-us';
  };
  if (compact) {
    return (
      <div className="language-switcher relative">
        <button
          className="flex items-center focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          title={LANGUAGES[currentLanguage]}
        >
          <svg className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
            <use href={`/ui.svg#${getFlagId(currentLanguage)}`} />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md py-1 z-10">
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <button
                key={code}
                className={`flex items-center px-3 py-2 hover:bg-gray-100 w-full ${currentLanguage === code ? 'bg-gray-50' : ''}`}
                onClick={() => handleLanguageChange(code as LanguageCode)}
                title={name}
              >
                <svg className="w-5 h-5 rounded-full overflow-hidden border border-gray-200">
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
    <div className="language-switcher relative">
      <button
        className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        title={LANGUAGES[currentLanguage]}
      >
        <svg className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 mr-2">
          <use href={`#${getFlagId(currentLanguage)}`} />
        </svg>
        <span className="text-sm">{LANGUAGES[currentLanguage]}</span>
        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md py-1 z-10">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <button
              key={code}
              className={`flex items-center px-3 py-2 text-sm hover:bg-gray-100 w-full text-left ${currentLanguage === code ? 'bg-gray-50' : ''}`}
              onClick={() => handleLanguageChange(code as LanguageCode)}
            >
              <svg className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 mr-2">
                <use href={`#${getFlagId(code as LanguageCode)}`} />
              </svg>
              <span>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
