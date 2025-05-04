import axios from 'axios';
import Browser from 'webextension-polyfill';
import './style.css';
const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Content root element");

try {
  console.log('content script loaded');
} catch (e) {
  console.error(e);
}

Browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Received message:", message);
  console.log("BG page received message", message, "from", sender);
  if (message.action === "doSomething") {
    // TODO: Improve this code by using some kind of MutationObserver to detect when the share button is available
    const shareButton = document.querySelector('.share')
    shareButton?.click()
    // Wait for the share menu to open
    await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the timeout as needed
    const pgnTab = document.querySelector('#tab-pgn')
    pgnTab?.click()
    await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the timeout as needed
    const pgn = document.querySelector('.share-menu-tab-pgn-textarea')
    console.log("PGN:", pgn.value)

    const response = await axios.post('https://lichess.org/api/import', {
      pgn: pgn.value
    })
    if (response.status === 200) {
      const url = response.data.url
      window.open(url, '_blank')
    }
    return sendResponse({ success: true });
  }
  return sendResponse({ success: false });
});
