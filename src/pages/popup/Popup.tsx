import { useState, useEffect } from "react";
import Browser from "webextension-polyfill";
import { GameState, GameStateType, GAME_STATE } from "../content/types";
import { getMessage, getCurrentLanguage } from "@src/utils/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { getSettings, applyTheme } from "@src/utils/settings";
import WelcomeScreen from "../../components/WelcomeScreen";
import { storageGet, storageSet } from "../../utils/storage";

export default function Popup() {
  const [gameState, setGameState] = useState<GameState>(
    GAME_STATE[GameStateType.NOT_CHESS_SITE]
  );
  const [version, setVersion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [onAction, setOnAction] = useState(false);
  const [theme, setTheme] = useState<string>("unknown");
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(false); // ✅ new state

  const applyCurrentTheme = async () => {
    const settings = await getSettings();
    applyTheme(settings.theme);
    setTheme(settings.theme);
  };

  useEffect(() => {
    const getExtensionInfo = async () => {
      const manifestData = Browser.runtime.getManifest();
      setVersion(manifestData.version);

      const settings = await getSettings();
      applyTheme(settings.theme);
    };

    getExtensionInfo();
    applyCurrentTheme();

    // ✅ check welcome state safely
    const checkWelcome = async () => {
      try {
        const stored = (await storageGet("hasSeenWelcome")) as { hasSeenWelcome?: boolean } | null;
        if (stored && stored.hasSeenWelcome) {
          setHasSeenWelcome(true);
        } else {
          setHasSeenWelcome(false);
        }
      } catch (error) {
        console.error("Error checking welcome state:", error);
        setHasSeenWelcome(false);
      }
    };
    

    checkWelcome();

    const handleMessage = (message: any) => {
      if (message.action === "updateGameState" && message.state) {
        setGameState(message.state);
        setIsLoading(false);
      } else if (message.action === "settingsChanged" && message.settings) {
        if (message.settings.theme) {
          applyTheme(message.settings.theme);
          setTheme(message.settings.theme);
        }
      }
    };

    Browser.runtime.onMessage.addListener(handleMessage);

    const getCurrentState = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const tabs = await Browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        const activeTab = tabs[0];

        if (activeTab && activeTab.id) {
          const response = (await Browser.tabs
            .sendMessage(activeTab.id, {
              action: "getGameState",
            })
            .catch(() => null)) as { state?: GameState } | null;

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

  // ✅ handle dismissing welcome
  const handleWelcomeContinue = async () => {
    await storageSet({ hasSeenWelcome: true });
    setHasSeenWelcome(true);
  };

  const handleClick = async () => {
    setOnAction(true);
    if (gameState.type === GameStateType.NOT_CHESS_SITE) {
      window.open("https://www.chess.com", "_blank");
      setOnAction(false);
      return;
    }
    const tabs = await Browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      await Browser.tabs.sendMessage(activeTab.id, {
        action: "openLichessAnalysis",
      });
    }
    setOnAction(false);
  };

  const getButtonColorClass = () => {
    switch (gameState.buttonState.color) {
      case "green":
        return "bg-green-600 cursor-pointer hover:bg-green-500 text-white focus:outline-none focus:ring-2 focus:ring-green-400";
      case "white":
        return "bg-white cursor-pointer text-green-600 border border-gray-300 hover:border-gray-400";
      case "yellow":
        return "bg-yellow-500 cursor-pointer text-gray-800 border border-gray-300 hover:border-gray-400";
      default:
        return "bg-gray-400 cursor-not-allowed text-gray-200";
    }
  };

  // ✅ show welcome screen if not seen
  if (!hasSeenWelcome) {
    return <WelcomeScreen onContinue={handleWelcomeContinue} />;
  }

  // ✅ otherwise show normal popup
  return (
    <div
      key={theme}
      className="flex flex-col bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      style={{
        backgroundColor:
          theme === "light"
            ? "#ffffff"
            : theme === "dark"
            ? "#1f2937"
            : undefined,
        color:
          theme === "light"
            ? "#1f2937"
            : theme === "dark"
            ? "#e5e7eb"
            : undefined,
      }}
    >
      <header
        className="p-4 border-b border-gray-200 dark:border-gray-700"
        style={{
          backgroundColor:
            theme === "light"
              ? "#ffffff"
              : theme === "dark"
              ? "#1f2937"
              : undefined,
          borderColor:
            theme === "light"
              ? "#e5e7eb"
              : theme === "dark"
              ? "#374151"
              : undefined,
        }}
      >
        <div className="flex justify-between mb-2">
          <button
            onClick={() =>
              Browser.tabs.create({
                url: Browser.runtime.getURL("src/pages/options/index.html"),
              })
            }
            className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 transition-colors cursor-pointer"
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

        <div className="flex flex-col items-center justify-center">
          <img
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

      <main
        className="flex-grow flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor:
            theme === "light"
              ? "#ffffff"
              : theme === "dark"
              ? "#1f2937"
              : undefined,
          color:
            theme === "light"
              ? "#1f2937"
              : theme === "dark"
              ? "#e5e7eb"
              : undefined,
        }}
      >
        {isLoading ? (
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
          disabled={onAction}
          className={`font-bold py-3 px-6 rounded-lg shadow-lg transition-colors transform 
            ${
              onAction
                ? "bg-gray-400 cursor-progress text-gray-200"
                : getButtonColorClass()
            }`}
        >
          {gameState.type === GameStateType.NOT_CHESS_SITE
            ? getMessage("goToChesscom")
            : getMessage("analyzeOnLichess")}
        </button>
      </main>

      <footer
        className="p-4 border-t border-gray-200 dark:border-gray-700 text-center"
        style={{
          backgroundColor:
            theme === "light"
              ? "#ffffff"
              : theme === "dark"
              ? "#1f2937"
              : undefined,
          borderColor:
            theme === "light"
              ? "#e5e7eb"
              : theme === "dark"
              ? "#374151"
              : undefined,
          color:
            theme === "light"
              ? "#1f2937"
              : theme === "dark"
              ? "#e5e7eb"
              : undefined,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex space-x-4 items-center">
            <a
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
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756"/>
              </svg>
            </a>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            v{version}
          </p>
        </div>
      </footer>
    </div>
  );
}
