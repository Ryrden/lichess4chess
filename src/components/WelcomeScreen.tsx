import Browser from "webextension-polyfill";
export default function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
      <img src={Browser.runtime.getURL("original.png")} alt="Lichess4Chess Logo"
            className="h-16 w-16 mb-2" />
      <h2 className="text-lg font-bold text-green-600 mb-2">Welcome to Lichess4Chess!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        This extension helps you analyze your Chess.com games directly on Lichess.
      </p>
      <button
        onClick={onContinue}
        className="bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-500 transition-colors"
      >
        Get Started
      </button>
    </div>
  );
}
