import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  detectPageType,
  isChessCom,
  isLichess,
  isLichessAnalyzePage,
  isLichessReviewPage,
  shouldActivateExtension,
} from '../pageDetection';
import { PageType } from '../types';

function setLocation(hostname: string, pathname: string) {
  vi.stubGlobal('location', { hostname, pathname, href: `https://${hostname}${pathname}` });
}

describe('pageDetection', () => {
  afterEach(() => vi.unstubAllGlobals());

  describe('detectPageType', () => {
    it('returns CHESS_COM_GAME for /game/live/ path', () => {
      setLocation('www.chess.com', '/game/live/115967698767');
      expect(detectPageType()).toBe(PageType.CHESS_COM_GAME);
    });

    it('returns CHESS_COM_GAME for /live/ path', () => {
      setLocation('www.chess.com', '/live/game/456');
      expect(detectPageType()).toBe(PageType.CHESS_COM_GAME);
    });

    it('returns OTHER for chess.com non-game page', () => {
      setLocation('www.chess.com', '/member/MagnusCarlsen');
      expect(detectPageType()).toBe(PageType.OTHER);
    });

    it('returns LICHESS_ANALYZE for /analysis path', () => {
      setLocation('lichess.org', '/analysis');
      expect(detectPageType()).toBe(PageType.LICHESS_ANALYZE);
    });

    it('returns LICHESS_REVIEW for /study/ path', () => {
      setLocation('lichess.org', '/study/abc123');
      expect(detectPageType()).toBe(PageType.LICHESS_REVIEW);
    });

    it('returns LICHESS_GAME for lichess game URL', () => {
      setLocation('lichess.org', '/abcdef1234');
      expect(detectPageType()).toBe(PageType.LICHESS_GAME);
    });

    it('returns OTHER for unknown site', () => {
      setLocation('www.google.com', '/');
      expect(detectPageType()).toBe(PageType.OTHER);
    });
  });

  describe('isChessCom', () => {
    it('returns true for chess.com', () => {
      setLocation('www.chess.com', '/');
      expect(isChessCom()).toBe(true);
    });

    it('returns false for lichess.org', () => {
      setLocation('lichess.org', '/');
      expect(isChessCom()).toBe(false);
    });
  });

  describe('isLichess', () => {
    it('returns true for lichess.org', () => {
      setLocation('lichess.org', '/');
      expect(isLichess()).toBe(true);
    });

    it('returns false for chess.com', () => {
      setLocation('www.chess.com', '/');
      expect(isLichess()).toBe(false);
    });
  });

  describe('isLichessAnalyzePage', () => {
    it('returns true on /analysis', () => {
      setLocation('lichess.org', '/analysis');
      expect(isLichessAnalyzePage()).toBe(true);
    });

    it('returns false on /study/', () => {
      setLocation('lichess.org', '/study/abc');
      expect(isLichessAnalyzePage()).toBe(false);
    });
  });

  describe('isLichessReviewPage', () => {
    it('returns true on /study/', () => {
      setLocation('lichess.org', '/study/abc');
      expect(isLichessReviewPage()).toBe(true);
    });

    it('returns false on /analysis', () => {
      setLocation('lichess.org', '/analysis');
      expect(isLichessReviewPage()).toBe(false);
    });
  });

  describe('shouldActivateExtension', () => {
    it('returns true for chess.com game page', () => {
      setLocation('www.chess.com', '/game/live/123');
      expect(shouldActivateExtension()).toBe(true);
    });

    it('returns true for lichess', () => {
      setLocation('lichess.org', '/analysis');
      expect(shouldActivateExtension()).toBe(true);
    });

    it('returns false for unrelated site', () => {
      setLocation('www.google.com', '/');
      expect(shouldActivateExtension()).toBe(false);
    });
  });
});
