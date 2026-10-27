import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPlayerGames } from '../chessComService';
import { ApiErrorCode } from '../types';

const mockGame = {
  url: 'https://www.chess.com/game/live/115967698767',
  pgn: '1.e4 e5 2.Nf3 Nc6',
  time_control: '600',
  end_time: 1700000000,
  rated: true,
  white: { rating: 2830, result: 'win', username: 'MagnusCarlsen' },
  black: { rating: 2700, result: 'resigned', username: 'Hikaru' },
};

describe('chessComService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('fetchPlayerGames', () => {
    it('returns games on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ games: [mockGame] }),
      } as Response);

      const result = await fetchPlayerGames('MagnusCarlsen', 2024, 1);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].url).toBe(mockGame.url);
    });

    it('returns NOT_FOUND when API returns empty games array', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ games: [] }),
      } as Response);

      const result = await fetchPlayerGames('NoGamesPlayer', 2024, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ApiErrorCode.NOT_FOUND);
    });

    it('returns NOT_FOUND on 404 response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await fetchPlayerGames('UnknownPlayer', 2024, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ApiErrorCode.NOT_FOUND);
    });

    it('returns NETWORK_ERROR when fetch throws', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('network error'));

      const result = await fetchPlayerGames('MagnusCarlsen', 2024, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ApiErrorCode.NETWORK_ERROR);
    });

    it('returns RATE_LIMIT on 429 response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response);

      const result = await fetchPlayerGames('MagnusCarlsen', 2024, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ApiErrorCode.RATE_LIMIT);
    });

    it('builds correct API URL with year/month', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ games: [mockGame] }),
      } as Response);

      await fetchPlayerGames('MagnusCarlsen', 2024, 3);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/player/MagnusCarlsen/games/2024/03'),
        expect.any(Object),
      );
    });
  });
});
