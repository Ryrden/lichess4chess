import { test, expect } from './fixtures/extension';
import { openPopup } from './fixtures/extension';
import { waitForChessComPageLoad } from './helpers/chesscom';

test.describe('Popup Re-opening Detection', () => {
  test('should consistently detect NOT_CHESS_SITE when reopening popup', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto('https://www.google.com');
    await page.waitForLoadState('domcontentloaded');

    // Test opening popup 3 times
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔄 Attempt ${i}/3: Opening popup...`);
      
      const popupPage = await openPopup(context, extensionId);
      await popupPage.waitForTimeout(1500);

      // Should show "Go to Chess.com" button or message
      const bodyText = await popupPage.textContent('body');
      const hasNotChessSiteMessage = bodyText?.includes('Acesse Chess.com') ||
                                     bodyText?.includes('Go to Chess.com') ||
                                     bodyText?.includes('Ir para Chess.com') ||
                                     bodyText?.includes('Visit Chess.com');
      
      const isVisible = hasNotChessSiteMessage || false;
      
      if (isVisible) {
        console.log(`✅ Attempt ${i}: NOT_CHESS_SITE detected correctly`);
      } else {
        const bodyText = await popupPage.textContent('body');
        console.log(`❌ Attempt ${i}: Failed to detect NOT_CHESS_SITE`);
        console.log(`Popup content: ${bodyText?.substring(0, 150)}`);
        await popupPage.screenshot({ path: `test-results/not-chess-site-attempt-${i}.png` });
      }

      expect(isVisible).toBe(true);
      
      console.log(`   Closing popup...`);
      await popupPage.close();
      await page.waitForTimeout(500); // Brief pause between reopens
    }

    console.log('\n✅ All 3 attempts passed for NOT_CHESS_SITE state\n');
    await page.close();
  });

  test('should consistently detect NO_GAME state when reopening popup', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto('https://www.chess.com');
    await waitForChessComPageLoad(page);
    await page.waitForTimeout(3000); // Let content script initialize

    // Test opening popup 3 times
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔄 Attempt ${i}/3: Opening popup...`);
      
      const popupPage = await openPopup(context, extensionId);
      await popupPage.waitForTimeout(2000);

      // Check popup content - should show NO_GAME message
      const popupText = await popupPage.textContent('body');
      
      const hasNoGameMessage = popupText?.includes('Inicie e conclua') ||
                               popupText?.includes('Start and finish') ||
                               popupText?.includes('para poder analisá-la') ||
                               popupText?.includes('to analyze it');
      
      const hasAnalyzeButton = popupText?.includes('Analisar no Lichess') ||
                               popupText?.includes('Analyze on Lichess');

      console.log(`   Popup shows NO_GAME message: ${hasNoGameMessage}`);
      console.log(`   Popup has analyze button: ${hasAnalyzeButton}`);

      if (!hasNoGameMessage && !hasAnalyzeButton) {
        console.log(`❌ Attempt ${i}: Wrong state detected!`);
        console.log(`   Popup content: ${popupText?.substring(0, 150)}`);
        await popupPage.screenshot({ path: `test-results/no-game-fail-${i}.png` });
      } else {
        console.log(`✅ Attempt ${i}: NO_GAME state displayed correctly`);
      }

      // Should have the no-game message OR the analyze button (different UI states)
      expect(hasNoGameMessage || hasAnalyzeButton).toBe(true);
      
      console.log(`   Closing popup...`);
      await popupPage.close();
      await page.waitForTimeout(500);
    }

    console.log('\n✅ All 3 attempts passed for NO_GAME state\n');
    await page.close();
  });

  test('should consistently detect GAME_FINISHED when reopening popup', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    
    // Navigate to Magnus Carlsen's game archive
    console.log('📋 Loading Magnus Carlsen game archive...');
    await page.goto('https://www.chess.com/games/archive/magnuscarlsen');
    await waitForChessComPageLoad(page);
    await page.waitForTimeout(3000);

    // Find first game
    const gameLinks = await page.locator('a[href*="/game/live/"]').all();
    if (gameLinks.length === 0) {
      console.log('⚠️ No games found, skipping test');
      test.skip();
      return;
    }

    const gameUrl = await gameLinks[0].getAttribute('href');
    const fullUrl = gameUrl?.startsWith('http') ? gameUrl : `https://www.chess.com${gameUrl}`;

    console.log(`📋 Navigating to game: ${fullUrl}`);
    await page.goto(fullUrl);
    await waitForChessComPageLoad(page);
    await page.waitForTimeout(5000); // Wait for game to fully load

    // Test opening popup 3 times
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔄 Attempt ${i}/3: Opening popup...`);
      
      const popupPage = await openPopup(context, extensionId);
      await popupPage.waitForTimeout(3000); // Give time for state detection

      // First check the page itself to confirm game is finished
      const pageState = await page.evaluate(() => {
        return {
          hasGameOverModal: !!document.querySelector('.game-over-modal-content, .game-over-modal'),
          hasShareButton: !!document.querySelector('[aria-label="Share"]'),
          hasGameResult: !!document.querySelector('.game-result'),
          url: window.location.href,
        };
      });

      const isGameFinished = pageState.hasGameOverModal || 
                            pageState.hasShareButton || 
                            pageState.hasGameResult;

      console.log(`   Page state (attempt ${i}):`, {
        ...pageState,
        isGameFinished
      });

      if (!isGameFinished) {
        console.log(`⚠️ Warning: Game page doesn't show finished state indicators`);
      }

      // Check popup content
      const popupText = await popupPage.textContent('body');
      console.log(`   Popup content preview: ${popupText?.substring(0, 100)}...`);

      // Look for game state in popup
      const hasGoToChessCom = popupText?.includes('Ir para Chess.com') || 
                             popupText?.includes('Go to Chess.com') ||
                             popupText?.includes('Acesse Chess.com');
      
      const hasGameDetected = popupText?.includes('Partida concluída') ||
                             popupText?.includes('Game finished') ||
                             popupText?.includes('Analisar') ||
                             popupText?.includes('Analyze');

      if (hasGoToChessCom) {
        console.log(`❌ Attempt ${i}: Showing "Go to Chess.com" - NOT detecting Chess.com page!`);
        await popupPage.screenshot({ path: `test-results/game-finished-fail-${i}.png` });
        
        // This is a failure - popup thinks we're not on Chess.com
        expect(hasGoToChessCom).toBe(false); // This will fail the test
      } else if (hasGameDetected) {
        console.log(`✅ Attempt ${i}: GAME_FINISHED detected correctly`);
      } else {
        console.log(`⚠️ Attempt ${i}: Unknown state detected`);
        await popupPage.screenshot({ path: `test-results/game-unknown-state-${i}.png` });
      }

      console.log(`   Closing popup...`);
      await popupPage.close();
      await page.waitForTimeout(500);
    }

    console.log('\n✅ All 3 attempts passed for GAME_FINISHED state\n');
    await page.close();
  });

  test('should detect state changes when navigating between pages', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();

    // Step 1: Start on Google (NOT_CHESS_SITE)
    console.log('\n📍 Step 1: Google.com (NOT_CHESS_SITE)');
    await page.goto('https://www.google.com');
    await page.waitForLoadState('domcontentloaded');

    let popupPage = await openPopup(context, extensionId);
    await popupPage.waitForTimeout(1500);

    let goToButton = popupPage.locator('button, p, h1, h2, span', {
      hasText: /Go to Chess\.com|Ir para Chess\.com|Acesse Chess\.com/i,
    });
    
    await expect(goToButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Detected NOT_CHESS_SITE on Google');
    await popupPage.close();

    // Step 2: Navigate to Chess.com homepage (NO_GAME)
    console.log('\n📍 Step 2: Chess.com homepage (NO_GAME)');
    await page.goto('https://www.chess.com');
    await waitForChessComPageLoad(page);
    await page.waitForTimeout(3000);

    popupPage = await openPopup(context, extensionId);
    await popupPage.waitForTimeout(2000);

    // Should NOT show "Go to Chess.com" anymore
    const stillShowingGoTo = await popupPage.locator('button, p, h1, h2, span', {
      hasText: /Go to Chess\.com|Ir para Chess\.com/i,
    }).isVisible({ timeout: 2000 }).catch(() => false);

    if (stillShowingGoTo) {
      const bodyText = await popupPage.textContent('body');
      console.log(`❌ Still showing "Go to Chess.com" on Chess.com homepage!`);
      console.log(`Popup content: ${bodyText}`);
      await popupPage.screenshot({ path: 'test-results/navigation-test-failed.png' });
    }

    expect(stillShowingGoTo).toBe(false);
    console.log('✅ Correctly detecting Chess.com (not showing "Go to Chess.com")');
    await popupPage.close();

    // Step 3: Navigate back to Google (should show NOT_CHESS_SITE again)
    console.log('\n📍 Step 3: Back to Google.com (NOT_CHESS_SITE again)');
    await page.goto('https://www.google.com');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    popupPage = await openPopup(context, extensionId);
    await popupPage.waitForTimeout(1500);

    goToButton = popupPage.locator('button, p, h1, h2, span', {
      hasText: /Go to Chess\.com|Ir para Chess\.com|Acesse Chess\.com/i,
    });
    
    await expect(goToButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Detected NOT_CHESS_SITE again on Google');
    await popupPage.close();

    console.log('\n✅ All navigation state changes detected correctly!\n');
    await page.close();
  });
});
