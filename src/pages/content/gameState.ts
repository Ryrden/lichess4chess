import { GAME_STATE, GameState } from "./types";

export const isChessSite = (): boolean => {
  return window.location.hostname.includes("chess.com");
};

export const isGameInProgress = (): boolean => {
  return (
    !!document.querySelector(".board-modal-container .clock-component") &&
    !document.querySelector(".board-layout-evaluation") &&
    !isGameFinished()
  );
};

export const isGameFinished = (): boolean => {
  return (
    !!document.querySelector(".game-over-modal-content") ||
    !!document.querySelector(".game-over-modal") ||
    !!document.querySelector("[aria-label='Share']") ||
    !!document.querySelector(".game-result")
  );
};

export const detectGameState = (): GameState => {
  if (!isChessSite()) {
    return GAME_STATE.NOT_CHESS_SITE;
  }

  if (isGameFinished()) {
    return GAME_STATE.GAME_FINISHED;
  }

  if (isGameInProgress()) {
    return GAME_STATE.GAME_IN_PROGRESS;
  }

  return GAME_STATE.NO_GAME_DETECTED;
};

export const getCurrentGamePgn = async (): Promise<string | null> => { 
  console.log("Starting PGN extraction via Chess.com API...");
  
  try {
    // Extract username from current page URL
    const url = window.location.href;
    console.log("Current URL:", url);
    
    // Extract username from chess.com URL patterns
    let username = null;
    const urlPatterns = [
      /chess\.com\/member\/([^\/\?]+)/,
      /chess\.com\/home\/user\/([^\/\?]+)/,
      /chess\.com\/live\/game\/(\d+)/,
      /chess\.com\/game\/live\/(\d+)/
    ];
    
    console.log("Trying to extract username from URL patterns...");
    for (let i = 0; i < urlPatterns.length; i++) {
      const pattern = urlPatterns[i];
      console.log(`Pattern ${i + 1}:`, pattern);
      const match = url.match(pattern);
      console.log(`Pattern ${i + 1} match result:`, match);
      if (match) {
        username = match[1];
        console.log("Extracted username from URL:", username);
        break;
      }
    }
    
    if (!username) {
      console.log("No username found in URL, trying page elements...");
      
      // Try to get username from page elements as fallback
      // First try the specific element with username attribute
      console.log("Checking for notifications-request element with username attribute...");
      const notificationsElement = document.querySelector('#notifications-request[username]');
      if (notificationsElement) {
        const usernameFromAttr = notificationsElement.getAttribute('username');
        console.log("Found username in notifications-request element:", usernameFromAttr);
        if (usernameFromAttr && usernameFromAttr.length > 0) {
          username = usernameFromAttr;
          console.log("Successfully extracted username from notifications-request element:", username);
        }
      }
      
    }
    
    console.log("Final username result:", username);
    
    if (!username) {
      console.log("No username found anywhere, throwing error...");
      throw new Error("Could not extract username from URL or page");
    }
    
    // Get current year and month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    
    console.log("Current year:", currentYear);
    console.log("Current month:", currentMonth);
    
    // Construct API endpoint
    const apiEndpoint = `https://api.chess.com/pub/player/${username}/games/${currentYear}/${currentMonth}`;
    console.log("API endpoint:", apiEndpoint);
    
    // Fetch data from API
    console.log("Fetching data from Chess.com API...");
    const response = await fetch(apiEndpoint);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API response received");
    console.log("Games count:", data.games?.length || 0);
    
    if (!data.games || data.games.length === 0) {
      throw new Error("No games found in API response");
    }
    
    // Get the last (most recent) game from the array
    const lastGame = data.games[data.games.length - 1];
    console.log("Last game:", lastGame);
    
    if (!lastGame.pgn) {
      throw new Error("No PGN found in the last game");
    }
    
    const pgn = lastGame.pgn;
    console.log("PGN found:", pgn.substring(0, 100) + '...');
    console.log("PGN length:", pgn.length);
    console.log("PGN extraction successful!");
    
    return pgn;
    
  } catch (error) {
    console.error("Error fetching PGN from API:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get PGN from API: ${errorMessage}`);
  }
};

