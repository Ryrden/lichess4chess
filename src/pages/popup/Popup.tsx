import { useState, useEffect } from "react";
import Browser from "webextension-polyfill";
import { GameState, GameStateType, GAME_STATE } from "../content/types";
import { getMessage, getCurrentLanguage } from "@src/utils/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { getSettings, applyTheme } from "@src/utils/settings";

export default function Popup() {
  const [gameState, setGameState] = useState<GameState>(
    GAME_STATE[GameStateType.NOT_CHESS_SITE]
  );
  const [version, setVersion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getExtensionInfo = async () => {
      const manifestData = Browser.runtime.getManifest();
      setVersion(manifestData.version);
      
      // Get and apply theme settings
      const settings = await getSettings();
      applyTheme(settings.theme);
    };

    getExtensionInfo();

    const handleMessage = (message: any) => {
      if (message.action === "updateGameState" && message.state) {
        setGameState(message.state);
        setIsLoading(false);
      }
    };

    Browser.runtime.onMessage.addListener(handleMessage);

    const getCurrentState = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading delay
        const tabs = await Browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        const activeTab = tabs[0];

        if (activeTab && activeTab.id) {
          const response = await Browser.tabs
            .sendMessage(activeTab.id, {
              action: "getGameState",
            })
            .catch((error) => {
              console.log("Failed to get game state", error);
              return null;
            });

          if (response && response.state) {
            setGameState(response.state);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.log("Error getting game state", error);
        setIsLoading(false);
      }
    };

    getCurrentState();
    return () => {
      Browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleClick = async () => {
    const tabs = await Browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      await Browser.tabs.sendMessage(activeTab.id, {
        action: "openLichessAnalysis",
      });
    }
  };

  const getButtonColorClass = () => {
    switch (gameState.buttonState.color) {
      case "green":
        return "bg-green-600 cursor-pointer hover:bg-green-500 text-white hover:scale-105";
      case "yellow":
        return "bg-yellow-500 cursor-not-allowed text-gray-800";
      default:
        return "bg-gray-400 cursor-not-allowed text-gray-200";
    }
  };
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      {" "}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700"><div className="flex justify-between mb-2">          <button
            onClick={() => Browser.tabs.create({ url: Browser.runtime.getURL('src/pages/options/index.html') })}
            className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 transition-colors"
            title={getMessage("optionsTitle") || "Options"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          <LanguageSwitcher compact={true} />
        </div>
        <div className="flex flex-col items-center justify-center">          <img
            src={Browser.runtime.getURL("original.png")}
            alt="Lichess4Chess Logo"
            className="h-16 w-16 mb-2"
          />
          <h1 className="text-xl font-bold text-green-600">Lichess4Chess</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getMessage("extSubtitle")}
          </p>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-6">        {isLoading ? (
          <p className="mb-6 text-gray-600 dark:text-gray-400 text-center">
            {getMessage("detectingGameState")}
          </p>
        ) : (
          <p className="mb-6 text-gray-600 dark:text-gray-400 text-center">
            {getMessage(gameState.message)}
          </p>
        )}
        <button
          onClick={handleClick}
          disabled={isLoading || !gameState.buttonState.enabled}
          className={`font-bold py-3 px-6 rounded-lg shadow-lg transition-colors transform focus:outline-none focus:ring-2 focus:ring-green-400 ${getButtonColorClass()}`}
        >
          {getMessage("analyzeOnLichess")}
        </button>      </main>{" "}
      <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex space-x-4 items-center">            <a
              href="https://github.com/ryrden/lichess4chess"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>            <a
              href="https://chromewebstore.google.com/detail/lichess4chess/jenelhcabimbmbhoeejapoapolemplop/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition-colors"
              title={getMessage("rateExtension") || "Rate us"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z" />              </svg>
            </a>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">v{version}</p>
        </div>
      </footer>
    </div>
  );
}
