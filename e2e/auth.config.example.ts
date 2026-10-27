/**
 * Chess.com authentication cookies (optional)
 * 
 * To use authenticated tests:
 * 1. Copy this file to e2e/auth.config.ts (will be gitignored)
 * 2. Login to Chess.com in Chrome
 * 3. Open DevTools > Application > Cookies > https://www.chess.com
 * 4. Copy the cookie values below
 * 5. Run tests normally
 * 
 * Without this file, tests will attempt to use public games only.
 */

export interface ChessComAuthConfig {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
  }>;
  username?: string; // Your Chess.com username for testing
}

// Example configuration (fill with your actual cookies)
export const authConfig: ChessComAuthConfig = {
  cookies: [
    {
      name: 'cookie2',
      value: 'YOUR_COOKIE2_VALUE_HERE',
      domain: '.chess.com',
      path: '/',
    },
    {
      name: 'session_id',
      value: 'YOUR_SESSION_ID_HERE',
      domain: '.chess.com',
      path: '/',
    },
    // Add other cookies as needed (cf, cid, etc.)
  ],
  username: 'YourChessComUsername', // Optional: your username
};
