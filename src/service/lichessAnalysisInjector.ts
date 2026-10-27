export function isOnLichessAnalysisPage(): boolean {
  return (
    window.location.hostname.includes('lichess.org') &&
    window.location.pathname.startsWith('/analysis')
  );
}

export async function loadPgnIntoLichess(pgn: string): Promise<boolean> {
  console.log('[Lichess4Chess] Loading PGN into analysis board...');

  try {
    let textarea = document.querySelector('textarea.copyable[spellcheck="false"]') as HTMLTextAreaElement | null;

    if (!textarea) {
      const pgnButton = findElementBySelectors(
        ['a[href*="paste"]', '.pgn-import', '[data-icon=""]', 'a[title*="Import"]', 'a[title*="PGN"]'],
        'pgn|import|paste'
      );

      if (!pgnButton) {
        console.error('[Lichess4Chess] Could not find PGN textarea');
        return false;
      }

      pgnButton.click();
      await waitForElement('textarea.copyable', 2000);
      textarea = document.querySelector('textarea.copyable[spellcheck="false"]') as HTMLTextAreaElement | null;
    }

    if (!textarea) {
      console.error('[Lichess4Chess] Could not find PGN textarea');
      return false;
    }

    await fillAndSubmitPgn(textarea, pgn);
    return true;
  } catch (error) {
    console.error('[Lichess4Chess] Error loading PGN:', error);
    return false;
  }
}

async function fillAndSubmitPgn(textarea: HTMLTextAreaElement, pgn: string): Promise<void> {
  if (textarea.value.trim() !== '') {
    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  textarea.value = pgn;
  textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true }));
  textarea.dispatchEvent(new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: new DataTransfer()
  }));
  textarea.focus();

  await new Promise(resolve => setTimeout(resolve, 100));

  const clicked = tryClickImportButton(textarea);
  if (clicked) {
    console.log('[Lichess4Chess] Successfully loaded PGN via analysis board UI');
  } else {
    console.log('[Lichess4Chess] PGN pasted, but no submit button found');
  }
}

function tryClickImportButton(textarea: HTMLTextAreaElement): boolean {
  const specific = document.querySelector('button.button.button-thin.bottom-action.text[data-icon=""]') as HTMLButtonElement | null;
  if (specific?.textContent?.includes('Import PGN')) {
    specific.click();
    return true;
  }

  for (const button of document.querySelectorAll('button')) {
    if (button.textContent?.trim() === 'Import PGN') {
      (button as HTMLButtonElement).click();
      return true;
    }
  }

  const container = textarea.closest('.pgn-import, form, .import-pgn, [class*="pgn"]');
  if (container) {
    const submit = container.querySelector('button[type="submit"], button.button.submit, .button[type="submit"]') as HTMLButtonElement | null;
    if (submit) {
      submit.click();
      return true;
    }
  }

  const fallback = findElementBySelectors(
    ['button[type="submit"]', 'button.submit', '.button.submit']
  );
  if (fallback) {
    (fallback as HTMLButtonElement).click();
    return true;
  }

  return false;
}

function findElementBySelectors(selectors: string[], textFallback?: string): HTMLElement | null {
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) return el;
    } catch {
      continue;
    }
  }

  if (textFallback) {
    const pattern = new RegExp(textFallback, 'i');
    for (const el of document.querySelectorAll('a, button')) {
      if (pattern.test(el.textContent || '')) return el as HTMLElement;
    }
  }

  return null;
}

function waitForElement(selector: string, timeout: number): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}
