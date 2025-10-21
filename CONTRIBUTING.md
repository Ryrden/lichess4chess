# Contributing to Lichess4Chess 💖

Thank you for your interest in contributing to Lichess4Chess! This browser extension brings Lichess analysis tools to Chess.com games, and we welcome contributions from the community.

## 🌟 Contributor Recognition

We deeply value and recognize all forms of contributions! Contributors are acknowledged in multiple ways:

- **GitHub Contributors**: Automatically featured in the repository's contributors section
- **README Hall of Fame**: Highlighted in our main README file
- **Extension Recognition**: Thanked in the extension's options page
- **Release Notes**: Significant contributions mentioned in release announcements
- **Community Shoutouts**: Recognition in our community channels

Every contribution, no matter how small, helps make Lichess4Chess better for the entire chess community! 🏆

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Internationalization (i18n)](#internationalization-i18n)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following dependencies installed:

- [Node.js](https://nodejs.org/) (version 16 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A Chromium-based browser (Chrome, Edge, Brave, etc.)
- [Git](https://git-scm.com/)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lichess4chess.git
   cd lichess4chess
   ```

## 🛠 Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development mode:**
   ```bash
   npm run dev
   ```

3. **Load the extension in your browser:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist_chrome` folder

## 🔄 Development Workflow

### Building the Extension

- **General build:** `npm run build`

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style guidelines

3. **Test your changes** thoroughly:
   - Test the extension on Chess.com
   - Ensure no console errors appear
   - Test with a fresh browser profile
   - Verify the build process works

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

## 📤 Submitting Changes

### Pull Request Process

1. **Push your changes:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - A clear description of the changes
   - Screenshots or demo videos when applicable
   - Reference to any related issues

## 🎨 Code Style Guidelines

### TypeScript/React

- Use TypeScript for all new code
- Follow React functional components with hooks
- Use descriptive variable and function names
- Add JSDoc comments for complex functions

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat: add new analysis feature
fix: resolve popup layout issue
docs: update README with new installation steps
style: format code with prettier
refactor: simplify game state management
test: add unit tests for utilities
chore: update dependencies
```

## 🧪 Testing

### Manual Testing

1. **Load the extension** in development mode
2. **Navigate to Chess.com** and start/view a game
3. **Test the main features:**
   - Analysis integration
   - UI interactions
   - Settings persistence
4. **Check browser console** for errors

## 🌍 Internationalization (i18n)

We support multiple languages through Chrome's i18n API.

### Adding New Strings

1. **Add to English locale** (`src/locales/en/messages.json`):
   ```json
   {
     "myNewString": {
       "message": "My new translatable string",
       "description": "Description for translators"
     }
   }
   ```

2. **Use in code:**
   ```typescript
   import { getMessage } from '../utils/i18n';
   
   const text = getMessage('myNewString');
   ```

3. **Add translations** to other locale files (`src/locales/pt_br/messages.json`, etc.)

### Current Supported Languages

- English (`en`)
- Portuguese Brazil (`pt_br`)

## 📦 Release Process

### Version Bumping

Follow [Semantic Versioning](https://semver.org/):

- **PATCH** (0.0.X): Bug fixes, small improvements
- **MINOR** (0.X.0): New features, backward compatible
- **MAJOR** (X.0.0): Breaking changes

Update version in both:
- `package.json`
- `manifest.json`

### Release Checklist

- [ ] All tests pass
- [ ] Version bumped appropriately
- [ ] CHANGELOG.md updated
- [ ] Built extension tested manually
- [ ] No console errors
- [ ] Permissions reviewed

## 🆘 Getting Help

### Communication

- **Issues:** Use GitHub Issues for bug reports and feature requests
- **Discussions:** Use GitHub Discussions for questions and ideas
- **Email:** Contact the maintainer at ryanssteles@gmail.com

### Reporting Bugs

When reporting bugs, please include:

1. **Environment details:**
   - Browser and version
   - Operating system
   - Extension version

2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Screenshots or console errors** if applicable
5. **Chess.com game URL** if relevant

### Suggesting Features

For feature requests:

1. Check existing issues to avoid duplicates
2. Describe the problem you're trying to solve
3. Explain your proposed solution
4. Consider providing mockups or examples

## 🙏 Recognition

Contributors will be recognized in:
- README.md acknowledgments
- Release notes
- Git commit history

Thank you for contributing to Lichess4Chess! 🎉
