import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractGameIdFromUrl, findTargetGame } from '../domUtils';

describe('domUtils', () => {
  afterEach(() => vi.unstubAllGlobals());

  describe('extractGameIdFromUrl', () => {
    it('reads window.location by default', () => {
      vi.stubGlobal('location', { href: 'https://www.chess.com/game/live/115967698767' });
      expect(extractGameIdFromUrl()).toBe('115967698767');
    });

    it.each([
      ['https://www.chess.com/game/live/115967698767', '115967698767'],
      ['https://www.chess.com/live/game/987654321', '987654321'],
      ['https://www.chess.com/game/145829301234', '145829301234'],
      ['https://www.chess.com/game/daily/9876543', '9876543'],
      ['https://www.chess.com/daily/game/555', '555'],
      ['https://www.chess.com/analysis/game/live/123456/review', '123456'],
      ['https://www.chess.com/live/game/123456?tab=review', '123456'],
      ['https://www.chess.com/game/live/123456#move=3', '123456'],
    ])('extracts the ID from %s', (href, id) => {
      expect(extractGameIdFromUrl(href)).toBe(id);
    });

    it.each([
      'https://www.chess.com/member/MagnusCarlsen',
      'https://www.chess.com/play/online',
      'https://www.chess.com/member/game123',
      'https://lichess.org/abcdef123',
      'not a url',
    ])('returns null for %s', (href) => {
      expect(extractGameIdFromUrl(href)).toBeNull();
    });
  });

  describe('findTargetGame', () => {
    const games = [
      { url: 'https://www.chess.com/game/live/111', pgn: 'pgn1' },
      { url: 'https://www.chess.com/game/live/2222', pgn: 'pgn2' },
      { url: 'https://www.chess.com/game/daily/333', pgn: 'pgn3' },
    ];

    it('finds the game with the exact ID', () => {
      expect(findTargetGame(games, '2222')).toBe(games[1]);
      expect(findTargetGame(games, '333')).toBe(games[2]);
    });

    it('does not match a game whose ID only contains the target ID', () => {
      expect(findTargetGame(games, '222')).toBeNull();
    });

    it('returns null instead of guessing when the ID is not found', () => {
      expect(findTargetGame(games, '999')).toBeNull();
    });

    it('returns null for an empty list', () => {
      expect(findTargetGame([], '111')).toBeNull();
    });
  });
});
