import { describe, expect, it, vi } from 'vitest';

vi.mock('webextension-polyfill', () => ({ default: { runtime: { sendMessage: vi.fn(() => Promise.resolve()) }, storage: { local: { get: vi.fn(() => Promise.resolve({})) } } } }));

import { findReviewButtons } from '../gameStateManager';

// Markup copied from a chess.com game page (October 2026), trimmed.
const page = `
  <div class="game-over-modal-shell-content game-over-modal-shell-v6">
    <a class="cc-button-component_b359d5b" href="/analysis/game/live/1?tab=review" aria-label="Game Review"><span>2 Great</span></a>
    <div class="game-over-modal-shell-buttons">
      <a class="cc-button-component_b359d5b game-over-primary-cta-game-over-primary-cta" data-variant="primary" href="/analysis/game/live/1?tab=review" aria-label="Game Review">Game Review</a>
    </div>
  </div>
  <div class="quick-analysis-component">
    <a href="/analysis/game/live/1?tab=review" aria-label="Game Review"><span>2 Great</span></a>
  </div>
  <div class="game-review-buttons-component">
    <a class="cc-button-component_b359d5b" data-variant="primary" href="/analysis/game/live/1?tab=review" aria-label="Revisão da partida">Revisão da partida</a>
  </div>`;

describe('findReviewButtons', () => {
  it('finds the modal and sidebar Game Review buttons, not the move-summary links', () => {
    document.body.innerHTML = page;
    const parents = findReviewButtons().map((button) => button.parentElement?.className);
    expect(parents).toEqual(['game-over-modal-shell-buttons', 'game-review-buttons-component']);
  });

  it('still finds the old class name', () => {
    document.body.innerHTML = '<div><a class="game-over-review-button-game-over-review-button">Game Review</a></div>';
    expect(findReviewButtons()).toHaveLength(1);
  });

  it('ignores the buttons the extension injected', () => {
    document.body.innerHTML = '<div><a class="lichess4chess-review-button" data-variant="primary" href="/x?tab=review">Go to Lichess Review</a></div>';
    expect(findReviewButtons()).toHaveLength(0);
  });
});
