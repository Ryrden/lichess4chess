import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractGameIdFromUrl, findTargetGame } from '../domUtils';

describe('domUtils', () => {
  afterEach(() => vi.unstubAllGlobals());

  describe('extractGameIdFromUrl', () => {
    it('extracts ID from /game/live/ URL', () => {
      vi.stubGlobal('location', { href: 'https://www.chess.com/game/live/115967698767' });
      expect(extractGameIdFromUrl()).toBe('115967698767');
    });

    it('extracts ID from /live/game/ URL', () => {
      vi.stubGlobal('location', { href: 'https://www.chess.com/live/game/987654321' });
      expect(extractGameIdFromUrl()).toBe('987654321');
    });

    it('returns null for non-game URL', () => {
      vi.stubGlobal('location', { href: 'https://www.chess.com/member/MagnusCarlsen' });
      expect(extractGameIdFromUrl()).toBeNull();
    });

    it('returns null for lichess URL', () => {
      vi.stubGlobal('location', { href: 'https://lichess.org/abcdef123' });
      expect(extractGameIdFromUrl()).toBeNull();
    });
  });

  describe('findTargetGame', () => {
    const games = [
      { url: 'https://www.chess.com/game/live/111', pgn: 'pgn1' },
      { url: 'https://www.chess.com/game/live/222', pgn: 'pgn2' },
      { url: 'https://www.chess.com/game/live/333', pgn: 'pgn3' },
    ];

    it('finds game by specific ID', () => {
      expect(findTargetGame(games, '222')).toBe(games[1]);
    });

    it('falls back to last game when ID not found', () => {
      expect(findTargetGame(games, '999')).toBe(games[2]);
    });

    it('falls back to last game when gameId is null', () => {
      expect(findTargetGame(games, null)).toBe(games[2]);
    });

    it('returns undefined for empty games array', () => {
      expect(findTargetGame([], null)).toBeUndefined();
    });
  });
});
