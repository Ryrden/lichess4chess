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
