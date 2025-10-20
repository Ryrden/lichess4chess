export function isOnLichessAnalysisPage(): boolean {
  return (
    window.location.hostname.includes('lichess.org') &&
    window.location.pathname.startsWith('/analysis')
  );
}

export async function loadPgnIntoLichess(pgn: string): Promise<boolean> {
  console.log('[Lichess4Chess] Loading PGN into analysis board...');
  
  try {
    const pgnTextarea = document.querySelector('textarea.copyable[spellcheck="false"]') as HTMLTextAreaElement;
    
    if (pgnTextarea) {
      if (pgnTextarea.value.trim() !== '') {
        pgnTextarea.value = '';
        pgnTextarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        pgnTextarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      pgnTextarea.value = pgn;
      
      pgnTextarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      pgnTextarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      pgnTextarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true }));
      
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: new DataTransfer()
      });
      pgnTextarea.dispatchEvent(pasteEvent);
      
      pgnTextarea.focus();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const importButton = document.querySelector('button.button.button-thin.bottom-action.text[data-icon=""]') as HTMLButtonElement;
      if (importButton && importButton.textContent?.includes('Import PGN')) {
        importButton.click();
        console.log('[Lichess4Chess] Successfully loaded PGN via analysis board UI');
        return true;
      }
      
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        if (button.textContent?.trim() === 'Import PGN') {
          (button as HTMLButtonElement).click();
          console.log('[Lichess4Chess] Successfully loaded PGN via analysis board UI');
          return true;
        }
      }
      
      const container = pgnTextarea.closest('.pgn-import, form, .import-pgn, [class*="pgn"]');
      if (container) {
        const submitButton = container.querySelector('button[type="submit"], button.button.submit, .button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
          console.log('[Lichess4Chess] Successfully loaded PGN via analysis board UI');
          return true;
        }
      }
      
      console.log('[Lichess4Chess] PGN pasted, but no submit button found');
      return true;
    }
    
    const pgnButton = findPgnImportButton();
    
    if (pgnButton) {
      pgnButton.click();
      
      await waitForElement('textarea.copyable', 2000);
      
      const textarea = document.querySelector('textarea.copyable[spellcheck="false"]') as HTMLTextAreaElement;
      if (textarea) {
        if (textarea.value.trim() !== '') {
          textarea.value = '';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        textarea.value = pgn;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        textarea.focus();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const importButton = document.querySelector('button.button.button-thin.bottom-action.text[data-icon=""]') as HTMLButtonElement;
        if (importButton && importButton.textContent?.includes('Import PGN')) {
          importButton.click();
          console.log('[Lichess4Chess] Successfully loaded PGN via analysis board UI');
          return true;
        }
        
        const submitButton = findSubmitButton();
        if (submitButton) {
          submitButton.click();
          console.log('[Lichess4Chess] Successfully loaded PGN via analysis board UI');
          return true;
        }
        
        console.log('[Lichess4Chess] PGN pasted, but no submit button found');
        return true;
      }
    }
    
    console.error('[Lichess4Chess] Could not find PGN textarea');
    return false;
  } catch (error) {
    console.error('[Lichess4Chess] Error loading PGN:', error);
    return false;
  }
}

function findPgnImportButton(): HTMLElement | null {
  const selectors = [
    'a[href*="paste"]',
    'button:contains("PGN")',
    '.pgn-import',
    '[data-icon=""]',
    'a[title*="Import"]',
    'a[title*="PGN"]'
  ];
  
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) return element;
    } catch (e) {
      continue;
    }
  }
  
  const links = document.querySelectorAll('a, button');
  for (const link of links) {
    const text = link.textContent?.toLowerCase() || '';
    if (text.includes('pgn') || text.includes('import') || text.includes('paste')) {
      return link as HTMLElement;
    }
  }
  
  return null;
}

function findSubmitButton(): HTMLElement | null {
  const selectors = [
    'button[type="submit"]',
    'button.submit',
    '.button.submit',
    'button:contains("Submit")',
    'button:contains("Import")',
    'button:contains("Load")'
  ];
  
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) return element;
    } catch (e) {
      continue;
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
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}
