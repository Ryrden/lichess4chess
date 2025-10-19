import { PageType } from './types';

export function detectPageType(): PageType {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  if (hostname.includes('chess.com')) {
    if (pathname.includes('/game/') || pathname.includes('/live/')) {
      return PageType.CHESS_COM_GAME;
    }
  }
  
  if (hostname.includes('lichess.org')) {
    if (pathname.startsWith('/analysis')) {
      return PageType.LICHESS_ANALYZE;
    }
    
    if (pathname.startsWith('/study/')) {
      return PageType.LICHESS_REVIEW;
    }
    
    if (pathname.match(/^\/[a-zA-Z0-9]{8,12}(?:\/(?:white|black))?$/)) {
      return PageType.LICHESS_GAME;
    }
  }
  
  return PageType.OTHER;
}

export function isChessCom(): boolean {
  return window.location.hostname.includes('chess.com');
}

export function isLichess(): boolean {
  return window.location.hostname.includes('lichess.org');
}

export function isLichessAnalyzePage(): boolean {
  return isLichess() && window.location.pathname.startsWith('/analysis');
}

export function isLichessReviewPage(): boolean {
  return isLichess() && window.location.pathname.startsWith('/study/');
}

export function shouldActivateExtension(): boolean {
  const pageType = detectPageType();
  return pageType !== PageType.OTHER;
}

