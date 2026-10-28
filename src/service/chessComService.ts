import { ApiResponse, ChessComGame } from './types';
import { createApiError, handleApiError } from './errorHandler';
import { getMessage } from '@src/utils/i18n';

const BASE_URL = 'https://api.chess.com/pub';
const REQUEST_TIMEOUT = 10000;

export async function fetchPlayerGames(
  username: string,
  year?: number,
  month?: number
): Promise<ApiResponse<ChessComGame[]>> {
  try {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;
    const monthStr = String(targetMonth).padStart(2, '0');
    
    const apiUrl = `${BASE_URL}/player/${username}/games/${targetYear}/${monthStr}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(apiUrl, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Chess.com API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.games || data.games.length === 0) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND' as any,
          message: getMessage('noGamesFound'),
          // English detail for logs; the message above is shown to the user.
          details: `No games found for player '${username}' in ${targetYear}/${monthStr}`,
          retryable: false
        }
      };
    }
    
    return {
      success: true,
      data: data.games
    };
  } catch (error) {
    const apiError = createApiError(error, `fetchPlayerGames(${username})`);
    await handleApiError(apiError, true);
    
    return {
      success: false,
      error: apiError
    };
  }
}

