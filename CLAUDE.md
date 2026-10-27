# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser extension (Manifest V3) that integrates Lichess analysis into Chess.com. Dual-build: Chrome (`dist_chrome/`) and Firefox (`dist_firefox/`). TypeScript + React 19 + Tailwind CSS v4 + Vite.

## Commands

```bash
npm run dev            # watch mode (nodemon, sets __DEV__=true, builds Chrome)
npm run build          # production build for Chrome
npm run build:firefox  # production build for Firefox

npm test               # unit tests (Vitest, jsdom)
npm run test:e2e       # E2E (requires e2e/auth.config.ts)
npm run test:e2e:ui    # interactive Playwright UI (preferred for development)
npx playwright test <file_name>  # run single test file

npx eslint src/        # lint (no npm script exists for this)
```

## Test setup

E2E tests require `e2e/auth.config.ts` (gitignored — must be created manually). It must export Chess.com cookies (`cookie2`) and username. See `e2e/AUTH_SETUP.md` for extraction instructions.

Tests always run with a single worker (`workers: 1`) and `headless: false` — extension context requires it.

## Architecture

```
src/pages/background/   # service worker — content filtering, state management
src/pages/content/      # content scripts injected into chess.com pages
src/pages/popup/        # extension popup UI
src/pages/options/      # settings page
src/service/            # business logic (Chess.com + Lichess API calls, game detection)
src/components/         # reusable React components
src/utils/              # i18n, settings, browser storage helpers
src/locales/            # en/, pt_br/, es/, fr/ and ru/ message files
```

Path aliases: `@src/*`, `@assets/*`, `@locales/*`, `@pages/*`.

Two Vite configs merge from `vite.config.base.ts` — Chrome uses MV3 service worker (module type), Firefox uses legacy scripts.

Two manifests: `manifest.json` (production) and `manifest.dev.json` (dev — different icons).

## Code style

- Double quotes, semicolons, 2-space indent
- TypeScript strict mode enabled
- No need to `import React` — automatic JSX runtime
- No Prettier config; use ESLint (`eslint-config-prettier` handles conflicts)

## i18n

All user-visible strings go through Chrome's native i18n API. Adding a new string requires an entry in **every** folder of `src/locales/` (`en`, `pt_br`, `es`, `fr`, `ru`). `src/utils/__tests__/i18n.test.ts` fails when a language is missing a key, a placeholder differs, or `extDescription` (the Chrome Web Store summary) passes 132 characters.

To add a language: create `src/locales/<code>/messages.json`, add it to `LANGUAGES` and `LANGUAGE_FLAGS` in `src/utils/i18n.ts`, draw its flag in `public/ui.svg`, and fill in the store listing for that language in the Chrome Web Store dashboard.

## Commits and PRs

Conventional Commits format required:
```
feat(popup): add language switcher
fix(content): correct game detection on live board
```

Branch naming: `feature/your-feature-name`.

PRs require:
- Manifest version bump (SemVer — patch/minor/major)
- i18n strings added for all supported languages
- Demo video for any UI changes

## Publishing

Chrome Web Store publishing is automated by `.github/workflows/release.yml`: bump the version in `manifest.json` and `package.json`, merge to `main`, then push a matching tag (`git tag v0.8.1 && git push origin v0.8.1`). The workflow builds, uploads and submits to the Chrome Web Store (`scripts/cws-publish.mjs`), and creates a GitHub release with the zip. See CONTRIBUTING.md for the required secrets.

Firefox Add-ons is still manual: `npm run build:firefox` and upload the zip.
