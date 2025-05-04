import { useEffect, useState } from "react";
import Browser from "webextension-polyfill";

export default function Popup() {
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    console.log("Button clicked!");
    Browser.runtime.sendMessage({ action: "doSomething" });
    const tabs = await Browser.tabs.query({ active: true, currentWindow: true });
    console.log("Tabs:", tabs);
    Browser.tabs.connect(tabs[0].id!,{ name: "popup" });
    const activeTab = tabs[0];
    if (activeTab) {
      await Browser.tabs.sendMessage(activeTab.id!, { 
        action: "doSomething" 
      });
    }

  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      {/* TODO: Button that goes to the options page */}
      {/* Must be on upper right corner and should be a gear wheel */}
      <header className="flex flex-col items-center justify-center text-white">
        {/* LOGO */}
        <p>Lichess Analyzer for Chess.com</p>
      </header>
      <section>
        {message}
        <button
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded cursor-pointer"
        >
          Go to Lichess Analysis
        </button>
      </section>
    </div>
  );
}
