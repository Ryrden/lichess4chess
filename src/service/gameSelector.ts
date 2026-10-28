import { ApiResponse, ChessComGame } from './types';
import { fetchPlayerGames } from './chessComService';
import { createApiError, handleApiError } from './errorHandler';
import { getMessage } from '@src/utils/i18n';

const STORAGE_KEY_USERNAME = 'chesscomUsername';
// Chess.com result codes for a draw (https://www.chess.com/news/view/published-data-api#game-results).
export const DRAW_RESULTS = new Set(['agreed', 'stalemate', 'repetition', 'insufficient', 'timevsinsufficient', '50move']);

/**
 * "1-0", "0-1" or "½-½" from the two sides' Chess.com result codes.
 * When neither side won, the game was a draw, even for draw codes not listed above.
 */
export function formatGameResult(whiteResult?: string, blackResult?: string): string {
  if (!whiteResult || !blackResult) return 'Unknown';
  if (whiteResult === 'win') return '1-0';
  if (blackResult === 'win') return '0-1';
  return '½-½';
}

export interface GameInfo {
  id: string;
  url: string;
  white: {
    username: string;
    rating: number;
  };
  black: {
    username: string;
    rating: number;
  };
  result: string;
  timeControl: string;
  endTime: Date;
  pgn: string;
}

export async function getChessComUsername(): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY_USERNAME);
    return result[STORAGE_KEY_USERNAME] || null;
  } catch (error) {
    console.error('Error getting Chess.com username:', error);
    return null;
  }
}

export async function clearChessComUsername(): Promise<void> {
  try {
    await chrome.storage.local.remove('chesscomUsername');
  } catch (error) {
    console.error('Error clearing Chess.com username:', error);
    throw error;
  }
}

export async function saveChessComUsername(username: string): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY_USERNAME]: username });
  } catch (error) {
    console.error('Error saving Chess.com username:', error);
    throw error;
  }
}

export async function getRecentGames(
  username: string,
  monthsBack: number = 1
): Promise<ApiResponse<GameInfo[]>> {
  try {
    const allGames: ChessComGame[] = [];
    const now = new Date();
    
    for (let i = 0; i < monthsBack; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const response = await fetchPlayerGames(username, year, month);
      
      if (response.success && response.data) {
        allGames.push(...response.data);
      }
    }
    
    if (allGames.length === 0) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND' as any,
          message: getMessage('noGamesFound'),
          details: `No games found for ${username} in the last ${monthsBack} month(s)`,
          retryable: false
        }
      };
    }
    
    const gameInfoList: GameInfo[] = allGames
      .map(game => convertToGameInfo(game))
      .filter(game => game !== null) as GameInfo[];
    
    gameInfoList.sort((a, b) => b.endTime.getTime() - a.endTime.getTime());
    
    return {
      success: true,
      data: gameInfoList
    };
  } catch (error) {
    const apiError = createApiError(error, `getRecentGames(${username})`);
    await handleApiError(apiError, true);
    
    return {
      success: false,
      error: apiError
    };
  }
}

function convertToGameInfo(game: ChessComGame): GameInfo | null {
  if (!game.pgn) {
    return null;
  }
  
  const urlParts = game.url.split('/');
  const id = urlParts[urlParts.length - 1] || 'unknown';
  
  const result = formatGameResult(game.white.result, game.black.result);
  
  return {
    id,
    url: game.url,
    white: {
      username: game.white.username,
      rating: game.white.rating
    },
    black: {
      username: game.black.username,
      rating: game.black.rating
    },
    result,
    timeControl: game.time_control,
    endTime: new Date(game.end_time * 1000),
    pgn: game.pgn
  };
}
