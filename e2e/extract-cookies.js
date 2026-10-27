/**
 * Cookie Helper Script
 * 
 * Run this in Chrome DevTools Console while logged into Chess.com
 * It will generate the cookies config for you.
 * 
 * STEPS:
 * 1. Login to Chess.com
 * 2. Press F12 (open DevTools)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter
 * 6. Copy the output to e2e/auth.config.ts
 */

(function() {
  console.log('🔍 Extracting Chess.com cookies...\n');
  
  const cookies = document.cookie.split(';').map(c => c.trim());
  const relevantCookies = [];
  
  // Important cookies for authentication
  const importantCookieNames = ['cookie2', 'sessionid', 'session_id', '_ga', '_gid', 'cf_clearance'];
  
  cookies.forEach(cookie => {
    const [name, value] = cookie.split('=');
    if (importantCookieNames.some(important => name.includes(important))) {
      relevantCookies.push({ name, value });
    }
  });
  
  console.log('✅ Found cookies:', relevantCookies.map(c => c.name).join(', '));
  console.log('\n📋 Copy this configuration to e2e/auth.config.ts:\n');
  
  const config = `export const authConfig: ChessComAuthConfig = {
  cookies: [
${relevantCookies.map(c => `    {
      name: '${c.name}',
      value: '${c.value}',
      domain: '.chess.com',
      path: '/',
    },`).join('\n')}
  ],
  username: 'YOUR_CHESS_COM_USERNAME', // TODO: Add your username
};`;
  
  console.log(config);
  console.log('\n⚠️  Remember to replace YOUR_CHESS_COM_USERNAME with your actual username!');
  
  // Try to copy to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(config).then(() => {
      console.log('\n✅ Configuration copied to clipboard!');
    }).catch(() => {
      console.log('\n⚠️  Could not copy to clipboard - please copy manually');
    });
  }
})();
