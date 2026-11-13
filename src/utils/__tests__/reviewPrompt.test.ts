import Browser from "webextension-polyfill";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  INITIAL_REVIEW_PROMPT_STATE,
  REVIEW_PROMPT_AT,
  REVIEW_PROMPT_PENDING_TTL_MS,
  ReviewPromptState,
  getReviewPromptState,
  isReviewPromptDue,
  markReviewed,
  recordSuccessfulUse,
  takePendingReviewPrompt,
} from "../reviewPrompt";

const DAY = 24 * 60 * 60 * 1000;
let syncStore: Record<string, unknown> = {};

beforeEach(() => {
  syncStore = {};
  (Browser.storage as unknown as { sync: unknown }).sync = {
    get: vi.fn(async (key: string) => (key in syncStore ? { [key]: syncStore[key] } : {})),
    set: vi.fn(async (items: Record<string, unknown>) => {
      syncStore = { ...syncStore, ...structuredClone(items) };
    }),
  };
  vi.mocked(Browser.runtime.getURL).mockImplementation((path: string) => `chrome-extension://test/${path}`);
});

const state = (overrides: Partial<ReviewPromptState>): ReviewPromptState => ({
  ...INITIAL_REVIEW_PROMPT_STATE,
  ...overrides,
});

/** Records `count` uses at `now`, claiming the card whenever it becomes due. Returns the uses that showed it. */
async function use(count: number, now: number): Promise<number[]> {
  const shownAt: number[] = [];
  for (let i = 0; i < count; i++) {
    if (await recordSuccessfulUse(now)) {
      expect(await takePendingReviewPrompt(now)).toBe(true);
      shownAt.push((await getReviewPromptState()).uses);
    }
  }
  return shownAt;
}

describe("isReviewPromptDue", () => {
  it("is due on the 10th use", () => {
    expect(isReviewPromptDue(state({ uses: 9 }), 0)).toBe(false);
    expect(isReviewPromptDue(state({ uses: 10 }), 0)).toBe(true);
  });

  it("waits 7 days after the previous ask", () => {
    const lastAskAt = 1_000 * DAY;
    expect(isReviewPromptDue(state({ uses: 15, asks: 1, lastAskAt }), lastAskAt + 6 * DAY)).toBe(false);
    expect(isReviewPromptDue(state({ uses: 15, asks: 1, lastAskAt }), lastAskAt + 7 * DAY)).toBe(true);
  });

  it("never asks after a review or after the last threshold", () => {
    expect(isReviewPromptDue(state({ uses: 50, reviewed: true }), 0)).toBe(false);
    expect(isReviewPromptDue(state({ uses: 500, asks: REVIEW_PROMPT_AT.length }), 0)).toBe(false);
  });
});

describe("review prompt flow", () => {
  it("asks on the 10th, 15th, 25th and 35th use when they are a week apart", async () => {
    const start = 1_000 * DAY;
    const shownAt = [
      ...(await use(10, start)),
      ...(await use(5, start + 7 * DAY)),
      ...(await use(10, start + 14 * DAY)),
      ...(await use(10, start + 21 * DAY)),
      ...(await use(100, start + 60 * DAY)),
    ];
    expect(shownAt).toEqual([10, 15, 25, 35]);
  });

  it("asks a heavy user at most once a week", async () => {
    const start = 1_000 * DAY;
    expect(await use(30, start)).toEqual([10]);
    // The 15th use was long ago: the next use after the gap is the one that asks.
    expect(await use(1, start + 7 * DAY)).toEqual([31]);
  });

  it("stops asking once the user clicks Leave a review", async () => {
    const start = 1_000 * DAY;
    await use(10, start);
    await markReviewed();
    expect(await use(100, start + 30 * DAY)).toEqual([]);
  });

  it("shows a pending card only once", async () => {
    await use(9, 0);
    expect(await recordSuccessfulUse(0)).toBe(true);
    expect(await takePendingReviewPrompt(0)).toBe(true);
    expect(await takePendingReviewPrompt(0)).toBe(false);
  });

  it("drops a stale pending card without counting it as an ask", async () => {
    await use(9, 0);
    await recordSuccessfulUse(0);
    expect(await takePendingReviewPrompt(REVIEW_PROMPT_PENDING_TTL_MS + 1)).toBe(false);
    expect((await getReviewPromptState()).asks).toBe(0);
    // The next use asks again.
    expect(await recordSuccessfulUse(REVIEW_PROMPT_PENDING_TTL_MS + 2)).toBe(true);
  });

  it("does nothing outside Chrome", async () => {
    vi.mocked(Browser.runtime.getURL).mockImplementation((path: string) => `moz-extension://test/${path}`);
    expect(await use(20, 0)).toEqual([]);
    expect(Browser.storage.sync.set).not.toHaveBeenCalled();
  });
});
