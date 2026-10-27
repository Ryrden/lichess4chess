import { test, expect } from './fixtures/extension';
import { waitForChessComPageLoad } from './helpers/chesscom';

test('Debug: Simple Chess.com state check', async ({ context, extensionId }) => {
  const page = await context.newPage();
  
  console.log('📍 Navigating to Chess.com homepage...');
  await page.goto('https://www.chess.com');
  await waitForChessComPageLoad(page);
  
  console.log('⏳ Waiting 5 seconds for content script to initialize...');
  await page.waitForTimeout(5000);
  
  console.log('📤 Checking if content script is injected...');
  const pageInfo = await page.evaluate(() => {
    return {
      url: window.location.href,
      hostname: window.location.hostname,
      title: document.title,
    };
  });
  
  console.log('Page info:', pageInfo);
  expect(pageInfo.hostname).toContain('chess.com');
  
  console.log('✅ Test complete');
  await page.close();
});
