import Browser from "webextension-polyfill";

/**
 * When to ask for a Chrome Web Store review.
 *
 * A "use" is a game that actually reached Lichess: a Chess.com game sent to
 * Lichess analysis, or one imported from the Lichess analysis page. The card is
 * shown on the 10th, 15th, 25th and 35th use, never twice within 7 days, and
 * never again once the user clicks "Leave a review" or after the 4th time.
 *
 * Nothing here leaves the browser. The state lives in storage.sync, so it
 * follows the user's browser account instead of resetting on a new computer.
 */
export const REVIEW_PROMPT_AT = [10, 15, 25, 35];
export const REVIEW_PROMPT_MIN_DAYS_BETWEEN = 7;
/** A use that opens a new Lichess tab marks the card as pending; the new tab must show it within this window. */
export const REVIEW_PROMPT_PENDING_TTL_MS = 2 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "reviewPrompt";

export interface ReviewPromptState {
  uses: number;
  asks: number;
  lastAskAt: number | null;
  reviewed: boolean;
  pendingSince: number | null;
}

export const INITIAL_REVIEW_PROMPT_STATE: ReviewPromptState = {
  uses: 0,
  asks: 0,
  lastAskAt: null,
  reviewed: false,
  pendingSince: null,
};

/** The store link points to the Chrome Web Store, so the card is Chrome-only for now. */
export function isReviewPromptSupported(): boolean {
  return Browser.runtime.getURL("").startsWith("chrome-extension://");
}

/** Whether the card should be shown now, given the state after the latest use. */
export function isReviewPromptDue(state: ReviewPromptState, now: number): boolean {
  if (state.reviewed || state.asks >= REVIEW_PROMPT_AT.length) return false;
  if (state.uses < REVIEW_PROMPT_AT[state.asks]) return false;
  return state.lastAskAt === null || now - state.lastAskAt >= REVIEW_PROMPT_MIN_DAYS_BETWEEN * DAY_MS;
}

export async function getReviewPromptState(): Promise<ReviewPromptState> {
  const result = (await Browser.storage.sync.get(STORAGE_KEY)) as { [STORAGE_KEY]?: Partial<ReviewPromptState> };
  return { ...INITIAL_REVIEW_PROMPT_STATE, ...(result[STORAGE_KEY] ?? {}) };
}

async function saveReviewPromptState(state: ReviewPromptState): Promise<void> {
  await Browser.storage.sync.set({ [STORAGE_KEY]: state });
}

/**
 * Counts a successful use. Returns true when the card is now due, in which case
 * it is marked as pending for the Lichess page that shows it.
 */
export async function recordSuccessfulUse(now: number = Date.now()): Promise<boolean> {
  if (!isReviewPromptSupported()) return false;
  const state = await getReviewPromptState();
  state.uses += 1;
  const due = isReviewPromptDue(state, now);
  if (due) state.pendingSince = now;
  await saveReviewPromptState(state);
  return due;
}

/**
 * Claims a pending card. Returns true at most once per pending card; the card
 * then counts as one of the asks, whether or not the user clicks anything.
 */
export async function takePendingReviewPrompt(now: number = Date.now()): Promise<boolean> {
  if (!isReviewPromptSupported()) return false;
  const state = await getReviewPromptState();
  if (state.pendingSince === null) return false;

  const fresh = now - state.pendingSince <= REVIEW_PROMPT_PENDING_TTL_MS;
  state.pendingSince = null;
  const show = fresh && !state.reviewed;
  if (show) {
    state.asks += 1;
    state.lastAskAt = now;
  }
  await saveReviewPromptState(state);
  return show;
}

/** The user clicked "Leave a review": never show the card again. */
export async function markReviewed(): Promise<void> {
  const state = await getReviewPromptState();
  state.reviewed = true;
  state.pendingSince = null;
  await saveReviewPromptState(state);
}
