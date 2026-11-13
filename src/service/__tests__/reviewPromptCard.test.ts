import Browser from "webextension-polyfill";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { showReviewPromptCard } from "../reviewPromptCard";
import { CHROME_WEB_STORE_REVIEWS_URL } from "@src/utils/storeLinks";

let syncStore: Record<string, unknown> = {};

beforeEach(() => {
  document.body.innerHTML = "";
  syncStore = {};
  (Browser.storage as unknown as { sync: unknown }).sync = {
    get: vi.fn(async (key: string) => (key in syncStore ? { [key]: syncStore[key] } : {})),
    set: vi.fn(async (items: Record<string, unknown>) => {
      syncStore = { ...syncStore, ...items };
    }),
  };
  vi.spyOn(window, "open").mockClear().mockImplementation(() => null);
});

const click = (card: HTMLElement, selector: string) =>
  card.querySelector<HTMLElement>(selector)!.dispatchEvent(new MouseEvent("click", { bubbles: true }));

describe("showReviewPromptCard", () => {
  it("renders the translated texts", async () => {
    const card = (await showReviewPromptCard())!;
    expect(card.textContent).toContain("reviewPromptTitle");
    expect(card.textContent).toContain("reviewPromptBody");
    expect(card.querySelector('[data-action="rate"]')?.textContent).toBe("reviewPromptRate");
    expect(card.getAttribute("aria-labelledby")).toBe(card.querySelector("p")?.id);
  });

  it("shows the extension logo next to the title", async () => {
    const card = (await showReviewPromptCard())!;
    const logo = card.querySelector<HTMLImageElement>(".lichess4chess-review-card__logo")!;
    expect(logo.src).toBe("chrome-extension://test/icon-128.png");
    expect(logo.alt).toBe("");
  });

  it("opens the store reviews page and remembers the review", async () => {
    const card = (await showReviewPromptCard())!;
    click(card, '[data-action="rate"]');
    expect(window.open).toHaveBeenCalledWith(CHROME_WEB_STORE_REVIEWS_URL, "_blank", "noopener");
    expect(document.querySelector(".lichess4chess-review-card")).toBeNull();
    await vi.waitFor(() => expect((syncStore.reviewPrompt as { reviewed: boolean }).reviewed).toBe(true));
  });

  it.each([".lichess4chess-review-card__close", '.lichess4chess-review-card__button--secondary'])(
    "%s closes the card without opening the store",
    async (selector) => {
      const card = (await showReviewPromptCard())!;
      click(card, selector);
      expect(window.open).not.toHaveBeenCalled();
      expect(document.querySelector(".lichess4chess-review-card")).toBeNull();
      expect(syncStore.reviewPrompt).toBeUndefined();
    }
  );

  it("sits above the Import Chess.com game button when it is on the page", async () => {
    document.body.innerHTML = '<button class="lichess4chess-floating-btn"></button>';
    const card = (await showReviewPromptCard())!;
    expect(card.classList.contains("lichess4chess-review-card--raised")).toBe(true);
  });

  it("never shows two cards", async () => {
    await showReviewPromptCard();
    expect(await showReviewPromptCard()).toBeNull();
    expect(document.querySelectorAll(".lichess4chess-review-card")).toHaveLength(1);
  });
});
