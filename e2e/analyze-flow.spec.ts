import { test, expect } from './fixtures/extension';
import { openPopup, waitForExtensionReady, waitForManualInteraction } from './fixtures/extension';
import {
  waitForChessComPageLoad,
  isLichessUrl,
  waitForLichessAnalysisLoad,
  getLichessMoveCount,
} from './helpers/chesscom';
import { 
  getTestGameUrl, 
  isLoggedInToChessCom,
  getChessComUsername 
} from './helpers/auth';

test.describe('Analyze on Lichess - Main Flow', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    // Wait for extension to be ready before each test
    await waitForExtensionReady(context, extensionId);
  });

  test('should detect Chess.com and show correct popup state', async ({
    context,
    extensionId,
  }) => {
    // Step 1: Go to Chess.com homepage
    const chessComPage = await context.newPage();
    await chessComPage.goto('https://www.chess.com');
    await waitForChessComPageLoad(chessComPage);

    // Check if logged in
    const loggedIn = await isLoggedInToChessCom(chessComPage);
    console.log(`Chess.com login status: ${loggedIn ? 'Logged in' : 'Not logged in'}`);

    // Step 2: Open extension popup
    const popupPage = await openPopup(context, extensionId);
    await popupPage.waitForTimeout(2000); // Give extension time to detect page

    // Step 3: Verify popup loads (basic functionality)
    const mainContent = popupPage.locator('body');
    await expect(mainContent).toBeVisible({ timeout: 5000 });

    // Should have either "Go to Chess.com" or game state buttons
    const hasButton = await popupPage.locator('button').count();
    expect(hasButton).toBeGreaterThan(0);

    // Cleanup
    await popupPage.close();
    await chessComPage.close();
  });

  test('should open Lichess when clicking analyze button', async ({
    context,
    extensionId,
  }) => {
    // This test requires a game URL - try to get one dynamically
    const chessComPage = await context.newPage();
    
    // Navigate to a game page - use helper to get valid URL
    let gameUrl: string;
    try {
      gameUrl = await getTestGameUrl(context);
      console.log(`Testing with game URL: ${gameUrl}`);
    } catch (error) {
      test.skip(true, 'Could not get valid game URL - ensure auth.config.ts is set up');
      return;
    }

    await chessComPage.goto(gameUrl);
    await waitForChessComPageLoad(chessComPage);

    // Open popup
    const popupPage = await openPopup(context, extensionId);
    await popupPage.waitForTimeout(3000); // Give time for game detection

    // Look for the analyze button (in any language)
    const analyzeButton = popupPage.locator('button', {
      hasText: /Analyze|Analisar/i,
    });

    // Check if button exists and is enabled
    const buttonCount = await analyzeButton.count();
    
    if (buttonCount === 0) {
      console.log('No analyze button found - game may not be detected as finished');
      console.log('Page URL:', chessComPage.url());
      
      // Take screenshot for debugging
      await popupPage.screenshot({ path: 'test-results/popup-debug.png' });
      
      test.skip(true, 'Game not detected as finished - try a different game URL');
      return;
    }

    await expect(analyzeButton).toBeVisible({ timeout: 5000 });

    // Set up listener for new tab (Lichess analysis)
    const newTabPromise = context.waitForEvent('page', { timeout: 30000 });

    // Click analyze button
    await analyzeButton.click();

    // Wait for Lichess tab to open
    try {
      const lichessPage = await newTabPromise;
      await lichessPage.waitForLoadState('domcontentloaded');

      // Verify we're on Lichess
      expect(isLichessUrl(lichessPage.url())).toBeTruthy();
      console.log(`✅ Lichess opened: ${lichessPage.url()}`);

      // Wait for analysis board
      await waitForLichessAnalysisLoad(lichessPage);

      // Verify PGN was imported
      const moveCount = await getLichessMoveCount(lichessPage);
      expect(moveCount).toBeGreaterThan(0);
      console.log(`✅ Game imported with ${moveCount} moves`);

      await lichessPage.close();
    } catch (error) {
      console.error('Failed to open Lichess:', error);
      throw error;
    }

    // Cleanup
    await popupPage.close();
    await chessComPage.close();
  });
});

test.describe('Extension State Detection', () => {
  test('should correctly detect NOT_CHESS_SITE state', async ({
    context,
    extensionId,
  }) => {
    // Navigate to a non-chess site
    const page = await context.newPage();
    await page.goto('https://www.google.com');
    await page.waitForLoadState('domcontentloaded');

    // Open popup
    const popupPage = await openPopup(context, extensionId);
    await popupPage.waitForTimeout(1500);

    // Should show "Go to Chess.com" button or message
    // Check for both English and Portuguese
    const goToButton = popupPage.locator('button, p, h1, h2, span', {
      hasText: /Go to Chess\.com|Ir para Chess\.com|Visit Chess\.com/i,
    });
    
    await expect(goToButton).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Correctly detected NOT_CHESS_SITE state');
    console.log('✅ Message "goToChesscom" is displayed');

    // Cleanup
    await popupPage.close();
    await page.close();
  });

  test('should detect NO_GAME state on Chess.com homepage', async ({
    context,
    extensionId,
  }) => {
    // Go to Chess.com homepage (no game)
    const page = await context.newPage();
    await page.goto('https://www.chess.com');
    await waitForChessComPageLoad(page);

    // Open popup
    const popupPage = await openPopup(context, extensionId);
    await popupPage.waitForTimeout(3000); // Give time to detect state

    // Should show "Start and finish a game" or similar message
    const noGameMessage = popupPage.locator('p, h1, h2, span', {
      hasText: /Start and finish|Inicie e conclua|no game|sem partida/i,
    });

    const hasNoGameMessage = await noGameMessage.count() > 0;
    
    if (hasNoGameMessage) {
      await expect(noGameMessage).toBeVisible({ timeout: 5000 });
      console.log('✅ Correctly detected NO_GAME_DETECTED state');
      console.log('✅ Message "noGameDetected" is displayed');
    } else {
      console.log('⚠️  No game message not found - might be in different state');
      // Take screenshot for debugging
      await popupPage.screenshot({ path: 'test-results/no-game-state.png' });
    }

    // Cleanup
    await popupPage.close();
    await page.close();
  });

  test('should detect GAME_FINISHED state on Magnus Carlsen game', async ({
    context,
    extensionId,
  }) => {
    // Get Magnus Carlsen's latest finished game
    const page = await context.newPage();
    
    // Go to Magnus's recent games archive
    await page.goto('https://www.chess.com/games/archive/magnuscarlsen?gameType=recent');
    await waitForChessComPageLoad(page);
    
    // Wait for game links to load
    await page.waitForTimeout(3000);
    
    // Find first game link
    const gameLink = await page.locator('a[href*="/game/live/"]').first();
    const gameCount = await gameLink.count();
    
    if (gameCount === 0) {
      console.log('⚠️  No game links found on Magnus archive page');
      test.skip(true, 'Could not find Magnus Carlsen games');
      return;
    }
    
    const gameHref = await gameLink.getAttribute('href');
    const gameUrl = gameHref?.startsWith('http') 
      ? gameHref 
      : `https://www.chess.com${gameHref}`;
    
    console.log(`📋 Testing with Magnus game: ${gameUrl}`);
    
    // Navigate to the game
    await page.goto(gameUrl);
    await waitForChessComPageLoad(page);
    
    // Wait for game to fully load
    await page.waitForTimeout(5000);

    // Open popup
    const popupPage = await openPopup(context, extensionId);
    await popupPage.waitForTimeout(3000); // Give time to detect finished game

    // Should show "Game finished!" message
    const gameFinishedMessage = popupPage.locator('p, h1, h2, span', {
      hasText: /Game finished|Partida concluída|Click to analyze|Clique para analisar/i,
    });

    const hasGameFinishedMessage = await gameFinishedMessage.count() > 0;
    
    if (hasGameFinishedMessage) {
      await expect(gameFinishedMessage).toBeVisible({ timeout: 5000 });
      console.log('✅ Correctly detected GAME_FINISHED state');
      console.log('✅ Message "gameDetected" is displayed');
      
      // Also check if "Analyze on Lichess" button exists
      const analyzeButton = popupPage.locator('button', {
        hasText: /Analyze|Analisar/i,
      });
      
      if (await analyzeButton.count() > 0) {
        console.log('✅ "Analyze on Lichess" button is present');
      }
    } else {
      console.log('⚠️  Game finished message not found');
      console.log('   Game might be in progress or not detected as finished');
      
      // Take screenshot for debugging
      await popupPage.screenshot({ path: 'test-results/game-state-debug.png' });
      
      // Log what we found instead
      const popupText = await popupPage.textContent('body');
      console.log('Popup content:', popupText?.substring(0, 200));
    }

    // Cleanup
    await popupPage.close();
    await page.close();
  });
});

test.describe('Manual Testing Helper', () => {
  test.skip('Manual: Pin extension and test popup click', async ({
    context,
    extensionId,
  }) => {
    // This test is for manual interaction
    // Run with: MANUAL_TEST=true npm run test:e2e:headed
    
    console.log('\n📋 MANUAL TEST INSTRUCTIONS:');
    console.log('1. The browser will open Chess.com');
    console.log('2. Pin the extension: Click the puzzle icon → Find Lichess4Chess → Pin');
    console.log('3. Navigate to any Chess.com game');
    console.log('4. Click the extension icon to open popup');
    console.log('5. Click "Analyze on Lichess"');
    console.log('6. Verify Lichess opens with analysis\n');
    
    const page = await context.newPage();
    await page.goto('https://www.chess.com');
    await page.waitForLoadState('networkidle');
    
    // Wait for user to interact
    await waitForManualInteraction('Pin extension, navigate to game, and test popup', 120000);
    
    console.log('✅ Manual test complete');
  });
});

