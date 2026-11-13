import Browser from "webextension-polyfill";
import { getMessage } from "@src/utils/i18n";
import { markReviewed, takePendingReviewPrompt } from "@src/utils/reviewPrompt";
import { getSettings } from "@src/utils/settings";
import { CHROME_WEB_STORE_REVIEWS_URL } from "@src/utils/storeLinks";

const CARD_CLASS = "lichess4chess-review-card";
const TITLE_ID = "lichess4chess-review-card-title";

function createButton(className: string, action: string, label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.action = action;
  button.textContent = label;
  return button;
}

/**
 * Small card in the bottom-right corner asking for a store review. It never
 * blocks the page: "Not now" and the X just close it.
 */
export async function showReviewPromptCard(): Promise<HTMLElement | null> {
  if (document.querySelector(`.${CARD_CLASS}`)) return null;

  const { theme } = await getSettings();
  const isDark =
    theme === "dark" || (theme === "system" && !!window.matchMedia?.("(prefers-color-scheme: dark)")?.matches);

  const card = document.createElement("div");
  card.className = CARD_CLASS;
  if (isDark) card.classList.add(`${CARD_CLASS}--dark`);
  // Sit above the "Import Chess.com game" floating button on the analysis page.
  if (document.querySelector(".lichess4chess-floating-btn")) card.classList.add(`${CARD_CLASS}--raised`);
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-labelledby", TITLE_ID);

  const header = document.createElement("div");
  header.className = `${CARD_CLASS}__header`;
  const brand = document.createElement("div");
  brand.className = `${CARD_CLASS}__brand`;
  const logo = document.createElement("img");
  logo.className = `${CARD_CLASS}__logo`;
  // icon-128 drawn at 24px stays sharp on high-density screens.
  logo.src = Browser.runtime.getURL("icon-128.png");
  logo.alt = "";
  logo.width = 24;
  logo.height = 24;
  const title = document.createElement("p");
  title.id = TITLE_ID;
  title.className = `${CARD_CLASS}__title`;
  title.textContent = getMessage("reviewPromptTitle");
  brand.append(logo, title);
  const close = createButton(`${CARD_CLASS}__close`, "later", "×");
  close.setAttribute("aria-label", getMessage("reviewPromptLater"));
  header.append(brand, close);

  const body = document.createElement("p");
  body.className = `${CARD_CLASS}__body`;
  body.textContent = getMessage("reviewPromptBody");

  const actions = document.createElement("div");
  actions.className = `${CARD_CLASS}__actions`;
  actions.append(
    createButton(`${CARD_CLASS}__button ${CARD_CLASS}__button--primary`, "rate", getMessage("reviewPromptRate")),
    createButton(`${CARD_CLASS}__button ${CARD_CLASS}__button--secondary`, "later", getMessage("reviewPromptLater"))
  );

  card.append(header, body, actions);

  card.addEventListener("click", (event) => {
    const action = (event.target as HTMLElement).closest<HTMLElement>("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "rate") {
      // Open first, while the click still counts as a user gesture.
      window.open(CHROME_WEB_STORE_REVIEWS_URL, "_blank", "noopener");
      markReviewed().catch((error) => console.error("[Lichess4Chess] Could not save review state:", error));
    }
    card.remove();
  });

  document.body.appendChild(card);
  return card;
}

/** Shows the card if a recent use left it pending. Safe to call on any page. */
export async function showReviewPromptIfDue(): Promise<void> {
  try {
    if (await takePendingReviewPrompt()) await showReviewPromptCard();
  } catch (error) {
    console.error("[Lichess4Chess] Review prompt failed:", error);
  }
}
