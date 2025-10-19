import { ApiResponse, ChessComGame } from './types';
import { fetchPlayerGames } from './chessComService';
import { createApiError, handleApiError } from './errorHandler';

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
    const result = await chrome.storage.local.get('chesscomUsername');
    return result.chesscomUsername || null;
  } catch (error) {
    console.error('Error getting Chess.com username:', error);
    return null;
  }
}

export async function saveChessComUsername(username: string): Promise<void> {
  try {
    await chrome.storage.local.set({ chesscomUsername: username });
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
          message: 'No games found for this user',
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
  
  let result = 'Unknown';
  if (game.white.result && game.black.result) {
    if (game.white.result === 'win') result = '1-0';
    else if (game.black.result === 'win') result = '0-1';
    else if (game.white.result === 'agreed' || game.white.result === 'stalemate' || game.white.result === 'repetition' || game.white.result === 'insufficient') {
      result = '½-½';
    }
  }
  
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
