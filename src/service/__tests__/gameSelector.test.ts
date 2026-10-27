import { describe, expect, it } from 'vitest';
import { DRAW_RESULTS, formatGameResult } from '../gameSelector';

describe('formatGameResult', () => {
  it('returns 1-0 when white wins', () => {
    expect(formatGameResult('win', 'checkmated')).toBe('1-0');
    expect(formatGameResult('win', 'timeout')).toBe('1-0');
  });

  it('returns 0-1 when black wins', () => {
    expect(formatGameResult('resigned', 'win')).toBe('0-1');
    expect(formatGameResult('abandoned', 'win')).toBe('0-1');
  });

  it.each([...DRAW_RESULTS])('returns ½-½ for the draw code %s', (code) => {
    expect(formatGameResult(code, code)).toBe('½-½');
  });

  it('treats any game with no winner as a draw', () => {
    expect(formatGameResult('some-new-draw-code', 'some-new-draw-code')).toBe('½-½');
  });

  it('returns Unknown when a result is missing', () => {
    expect(formatGameResult(undefined, 'win')).toBe('Unknown');
    expect(formatGameResult('win', '')).toBe('Unknown');
  });
});
