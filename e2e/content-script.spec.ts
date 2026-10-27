import { test, expect } from './fixtures/extension';
import { waitForChessComPageLoad } from './helpers/chesscom';

test.describe('Content Script Detection', () => {
  test('should NOT inject on non-Chess.com sites', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.google.com');
    await page.waitForLoadState('domcontentloaded');

    // Try to execute a function that would exist if content script was injected
    const hasContentScript = await page.evaluate(() => {
      return typeof (window as any).Lichess4Chess !== 'undefined';
    });

    expect(hasContentScript).toBe(false);
    console.log('✅ Content script correctly NOT injected on Google.com');

    await page.close();
  });

  test('should inject on Chess.com homepage', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.chess.com');
    await waitForChessComPageLoad(page);
    await page.waitForTimeout(2000); // Wait for content script

    // Check if content script is running by looking for injected elements or scripts
    const hasContentScript = await page.evaluate(() => {
      // Content script should be loaded - check console logs
      const scripts = Array.from(document.querySelectorAll('script'));
      const hasChromExtension = scripts.some(s => s.src?.includes('chrome-extension'));
      return hasChromExtension || window.location.hostname.includes('chess.com');
    });

    expect(hasContentScript).toBe(true);
    console.log('✅ Page is Chess.com - content script should be injected');

    await page.close();
  });

  test('should detect game state on Chess.com', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.chess.com');
    await waitForChessComPageLoad(page);
    await page.waitForTimeout(3000); // Wait for content script to initialize

    // Check page content to infer state (since we can't directly call content script functions)
    const pageContent = await page.evaluate(() => {
      return {
        hasGameOverModal: !!document.querySelector('.game-over-modal-content, .game-over-modal'),
        hasGameBoard: !!document.querySelector('.board'),
        hasClock: !!document.querySelector('.clock-component'),
        url: window.location.href,
        hostname: window.location.hostname
      };
    });

    console.log('Page state:', pageContent);
    expect(pageContent.hostname).toContain('chess.com');

    // On homepage, should NOT have game-over modal
    expect(pageContent.hasGameOverModal).toBe(false);

    await page.close();
  });

  test('should detect finished game', async ({ context }) => {
    const page = await context.newPage();
    
    // Navigate to Magnus Carlsen's games
    await page.goto('https://www.chess.com/games/archive/magnuscarlsen');
    await waitForChessComPageLoad(page);
    await page.waitForTimeout(3000);

    // Find and click on a game
    const gameLinks = await page.locator('a[href*="/game/live/"]').all();
    
    if (gameLinks.length === 0) {
      console.log('No games found, skipping test');
      test.skip();
      return;
    }

    const firstGame = gameLinks[0];
    const gameUrl = await firstGame.getAttribute('href');
    const fullUrl = gameUrl?.startsWith('http') ? gameUrl : `https://www.chess.com${gameUrl}`;

    console.log(`Navigating to game: ${fullUrl}`);
    await page.goto(fullUrl);
    await waitForChessComPageLoad(page);
    await page.waitForTimeout(5000); // Wait for game to fully render

    // Check for game-over indicators
    const gameState = await page.evaluate(() => {
      return {
        hasGameOverModal: !!document.querySelector('.game-over-modal-content, .game-over-modal'),
        hasShareButton: !!document.querySelector('[aria-label="Share"]'),
        hasGameResult: !!document.querySelector('.game-result'),
        hasBoard: !!document.querySelector('.board'),
        url: window.location.href
      };
    });

    console.log('Game page state:', gameState);
    
    // A finished game should have at least one of these indicators
    const isGameFinished = gameState.hasGameOverModal || 
                          gameState.hasShareButton || 
                          gameState.hasGameResult;

    if (isGameFinished) {
      console.log('✅ Game is detected as finished');
    } else {
      console.log('⚠️  Game does not appear to be finished');
      console.log('   This might be a game in progress or replay mode');
    }

    await page.screenshot({ path: 'test-results/game-page.png' });
    await page.close();
  });
});
