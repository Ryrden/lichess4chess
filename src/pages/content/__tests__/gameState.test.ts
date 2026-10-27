import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectGameState, isChessSite, isGameFinished, isGameInProgress } from '../gameState';
import { GAME_STATE } from '../types';

function setHostname(hostname: string) {
  vi.stubGlobal('location', {
    hostname,
    href: `https://${hostname}/`,
    pathname: '/',
  });
}

describe('gameState', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  describe('isChessSite', () => {
    it('returns true for chess.com', () => {
      setHostname('www.chess.com');
      expect(isChessSite()).toBe(true);
    });

    it('returns false for google.com', () => {
      setHostname('www.google.com');
      expect(isChessSite()).toBe(false);
    });

    it('returns false for lichess.org', () => {
      setHostname('lichess.org');
      expect(isChessSite()).toBe(false);
    });
  });

  describe('isGameFinished', () => {
    it('detects .game-over-modal-content', () => {
      document.body.innerHTML = '<div class="game-over-modal-content"></div>';
      expect(isGameFinished()).toBe(true);
    });

    it('detects .game-over-modal', () => {
      document.body.innerHTML = '<div class="game-over-modal"></div>';
      expect(isGameFinished()).toBe(true);
    });

    it('detects Share button by aria-label', () => {
      document.body.innerHTML = '<button aria-label="Share"></button>';
      expect(isGameFinished()).toBe(true);
    });

    it('detects .game-result element', () => {
      document.body.innerHTML = '<div class="game-result">1-0</div>';
      expect(isGameFinished()).toBe(true);
    });

    it('returns false when no game-over indicators present', () => {
      document.body.innerHTML = '<div class="board"><div class="pieces"></div></div>';
      expect(isGameFinished()).toBe(false);
    });
  });

  describe('isGameInProgress', () => {
    it('returns true when clock visible and no finished state', () => {
      document.body.innerHTML = `
        <div class="board-modal-container">
          <div class="clock-component"></div>
        </div>
      `;
      expect(isGameInProgress()).toBe(true);
    });

    it('returns false when game-over modal is also present', () => {
      document.body.innerHTML = `
        <div class="board-modal-container">
          <div class="clock-component"></div>
        </div>
        <div class="game-over-modal-content"></div>
      `;
      expect(isGameInProgress()).toBe(false);
    });

    it('returns false when board-layout-evaluation present (analysis mode)', () => {
      document.body.innerHTML = `
        <div class="board-modal-container">
          <div class="clock-component"></div>
        </div>
        <div class="board-layout-evaluation"></div>
      `;
      expect(isGameInProgress()).toBe(false);
    });

    it('returns false with empty DOM', () => {
      expect(isGameInProgress()).toBe(false);
    });
  });

  describe('detectGameState', () => {
    it('returns NOT_CHESS_SITE for non-chess site', () => {
      setHostname('www.google.com');
      expect(detectGameState()).toBe(GAME_STATE.NOT_CHESS_SITE);
    });

    it('returns GAME_FINISHED when game-over modal present on chess.com', () => {
      setHostname('www.chess.com');
      document.body.innerHTML = '<div class="game-over-modal-content"></div>';
      expect(detectGameState()).toBe(GAME_STATE.GAME_FINISHED);
    });

    it('returns GAME_IN_PROGRESS when clock visible on chess.com', () => {
      setHostname('www.chess.com');
      document.body.innerHTML = `
        <div class="board-modal-container">
          <div class="clock-component"></div>
        </div>
      `;
      expect(detectGameState()).toBe(GAME_STATE.GAME_IN_PROGRESS);
    });

    it('returns NO_GAME_DETECTED on chess.com homepage', () => {
      setHostname('www.chess.com');
      document.body.innerHTML = '<div class="home-page"></div>';
      expect(detectGameState()).toBe(GAME_STATE.NO_GAME_DETECTED);
    });
  });
});
