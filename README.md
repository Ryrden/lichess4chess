# Lichess4Chess

<!-- Shields Example, there are N different shields in https://shields.io/ -->

![GitHub last commit](https://img.shields.io/github/last-commit/ryrden/lichess4chess)
![GitHub language count](https://img.shields.io/github/languages/count/ryrden/lichess4chess)
![Github repo size](https://img.shields.io/github/repo-size/ryrden/lichess4chess)
![Github stars](https://img.shields.io/github/stars/ryrden/lichess4chess?style=social)

![Lichess4Chess](https://i.imgur.com/Ve95zwx.png)

> Lichess Analysis for Chess.com Games

## Prerequisites

Before you begin, make sure you have the following dependencies installed:

- [Node.js](https://nodejs.org/) (version 16 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- Google Chrome browser

## How to run the project

Follow the steps below to run the project on your local machine:

Execute the following commands from the project root folder:

<!-- Here is all example, just change -->

### Clone this repository

```bash
git clone https://github.com/ryrden/lichess4chess.git
cd lichess4chess
```

### Install the dependencies

```bash
npm install
```

### Build the extension

```bash
npm run build
# or specifically for Chrome
npm run build:chrome
```

This will create the extension files in the `dist_chrome` directory.

### Run the project in development mode

```bash
npm run dev
# or specifically for Chrome
npm run dev:chrome
```

This will start the development server with hot reloading.

### Install the extension in Chrome Developer Mode

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top-right corner
4. Click on "Load unpacked"
5. Browse to the project directory and select the `dist_chrome` folder
6. The extension should now appear in your extensions list

![Chrome Developer Mode](https://i.imgur.com/6Lmnt9L.png)

### Using the Extension

1. Pin the extension to your toolbar by clicking the extensions icon in Chrome and clicking the pin icon next to Lichess4Chess
2. Navigate to a Chess.com game page
3. Click on the Lichess4Chess extension icon in your toolbar
4. Use the popup interface to analyze the current game with Lichess

## Testing

The project includes end-to-end (E2E) tests using Playwright to ensure the extension works correctly in a real browser environment.

### Quick Start

```bash
# 1. Configure Chess.com authentication (REQUIRED for full tests)
#    See detailed instructions below

# 2. Build and run tests
npm run test:e2e

# 3. View test results
npx playwright show-report
```

### Setting Up Authentication

**Most tests require Chess.com login** to access game pages. Follow these steps:

1. **Copy the auth config template:**
   ```bash
   cp e2e/auth.config.example.ts e2e/auth.config.ts   # gitignored, never commit it
   ```

2. **Get your Chess.com cookies:**
   - Login to Chess.com in Chrome
   - Press `F12` (open DevTools)
   - Go to **Application** tab → **Cookies** → `https://www.chess.com`
   - Find and copy the `cookie2` value (main auth cookie)
   - Also copy `sessionid` or `session_id` if present

3. **Edit `e2e/auth.config.ts`:**
   ```typescript
   export const authConfig: ChessComAuthConfig = {
     cookies: [
       {
         name: 'cookie2',
         value: 'paste_your_cookie_value_here', // Paste from DevTools
         domain: '.chess.com',
         path: '/',
       },
     ],
     username: 'your_chess_com_username', // Your Chess.com username
   };
   ```

4. **Run tests:**
   ```bash
   npm run test:e2e
   ```

📖 **Full guide:** See [e2e/AUTH_SETUP.md](e2e/AUTH_SETUP.md) for detailed instructions with screenshots.

### Running E2E Tests

Before running tests, make sure to build the extension:

```bash
# Build and run all E2E tests (headless)
npm run test:e2e

# Run tests with Playwright UI (interactive mode)
npm run test:e2e:ui

# Run tests with debug mode (step through tests)
npm run test:e2e:debug

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# Watch mode (see browser + slow workers, good for debugging)
npm run test:e2e:watch
```

**💡 Tip:** When running in headed mode, you can **pin the extension** by clicking the puzzle icon 🧩 in the browser toolbar and pinning "Lichess4Chess". See [e2e/PINNING_EXTENSION.md](e2e/PINNING_EXTENSION.md) for details.

### Test Coverage

The E2E tests cover the following scenarios:

- **Main Analysis Flow**: Detecting a finished Chess.com game and opening Lichess analysis
- **State Detection**: Correctly identifying different page states (Chess.com game, profile, external sites)
- **API Integration**: Validating Chess.com API calls and Lichess import
- **PGN Extraction**: Testing both API and DOM-based PGN extraction methods

### Testing Without Chess.com Account

All tests use **public Chess.com games** from notable players (e.g., Magnus Carlsen, Hikaru Nakamura), so **no Chess.com account is required**. The extension uses Chess.com's public API (`api.chess.com/pub/*`) for fetching game data.

### Installing Playwright Browsers

If this is your first time running Playwright tests, install the required browser:

```bash
npx playwright install chromium
```

### Test Reports

After running tests, you can view detailed HTML reports:

```bash
npx playwright show-report
```

## Folder Structure

The project folder structure is organized as follows:

```text
/
|-- dist_chrome/           # Generated extension files for Chrome
|-- public/               # Static assets
|   |-- icons, styles, etc.
|-- src/                  # Source code
|   |-- assets/           # Assets and styles
|   |-- locales/          # Localization files
|   |-- pages/            # Extension pages
|   |   |-- background/   # Service worker
|   |   |-- content/      # Content scripts
|   |   |-- devtools/     # DevTools page
|   |   |-- options/      # Options page
|   |   |-- panel/        # Panel UI
|   |   |-- popup/        # Popup UI
|   |-- hooks/            # React hooks
```

### Description of key directories

- `src/pages/content`: Contains the content scripts that run on Chess.com pages
- `src/pages/popup`: The extension popup UI shown when clicking the extension icon
- `src/pages/background`: Background service worker for the extension
- `src/pages/options`: Options page for extension settings
- `src/pages/panel`: Panel UI elements
- `src/hooks`: Custom React hooks for state management

### Configuration Files

- `manifest.json`: Main extension configuration
- `vite.config.*.ts`: Vite build configurations for different browsers
- `nodemon.*.json`: Development server configurations

## How to Contribute

If you want to contribute to this project, follow the steps below:

1. Fork this repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Create a pull request

Alternatively, consult the GitHub documentation on [how to create a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## Contributors

We are deeply grateful to all the amazing people who have supported and contributed to Lichess4Chess!

<a href="https://github.com/ryrden/lichess4chess/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ryrden/lichess4chess" alt="Contributors" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Credits

This project was built using the [vite-web-extension](https://github.com/JohnBra/vite-web-extension) template by [JohnBra](https://github.com/JohnBra).

## License

This project is under license. See [LICENSE](LICENSE) for more information.

## Back to the top

[⬆ Back to the top](#lichess4chess)
