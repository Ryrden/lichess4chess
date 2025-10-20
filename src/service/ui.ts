import { GameInfo, getRecentGames, getChessComUsername, saveChessComUsername } from './gameSelector';
import { loadPgnIntoLichess } from './lichessAnalysisInjector';
import { isLichessAnalyzePage } from './pageDetection';

let modalElement: HTMLElement | null = null;
let isModalOpen = false;
let isLoadingGame = false; 


export function initializeGameSelectorUI(): void {
  if (!isLichessAnalyzePage()) {
    return;
  }
  
  injectFloatingButton();
}


function injectFloatingButton(): void {
  if (document.querySelector('.lichess4chess-floating-btn')) {
    return;
  }
  
  const button = document.createElement('button');
  button.className = 'lichess4chess-floating-btn';
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    <span>Import Chess.com Game</span>
  `;
  button.title = 'Import Chess.com Game';
  
  button.addEventListener('click', (e) => {
    e.preventDefault();
    showGameSelectorModal();
  });
  
  document.body.appendChild(button);
}

export async function showGameSelectorModal(): Promise<void> {
  if (isModalOpen) {
    return;
  }
  
  isModalOpen = true;
  
  modalElement = createModal();
  document.body.appendChild(modalElement);
  
  const savedUsername = await getChessComUsername();
  
  if (savedUsername) {
    loadGamesForUser(savedUsername);
  } else {
    showUsernameInput();
  }
}


function createModal(): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'lichess4chess-modal';
  modal.innerHTML = `
    <div class="lichess4chess-modal-overlay"></div>
    <div class="lichess4chess-modal-content">
      <div class="lichess4chess-modal-header">
        <h2>Import Chess.com Game</h2>
        <button class="lichess4chess-close-btn" title="Close (Esc)">×</button>
      </div>
      <div class="lichess4chess-modal-body">
        <div class="lichess4chess-loading">Loading...</div>
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('.lichess4chess-close-btn');
  closeBtn?.addEventListener('click', closeModal);
  

  const overlay = modal.querySelector('.lichess4chess-modal-overlay');
  overlay?.addEventListener('click', closeModal);
  

  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
  
  return modal;
}


function showUsernameInput(): void {
  if (!modalElement) return;
  
  const body = modalElement.querySelector('.lichess4chess-modal-body');
  if (!body) return;
  
  body.innerHTML = `
    <div class="lichess4chess-username-form">
      <label for="lichess4chess-username">
        Enter your Chess.com username:
      </label>
      <input 
        type="text" 
        id="lichess4chess-username" 
        class="lichess4chess-input"
        placeholder="Enter username"
        autocomplete="off"
      />
      <button class="lichess4chess-btn" id="lichess4chess-submit-username">
        Load Games
      </button>
    </div>
  `;
  
  const input = body.querySelector('#lichess4chess-username') as HTMLInputElement;
  const button = body.querySelector('#lichess4chess-submit-username') as HTMLButtonElement;
  
  const submitHandler = async () => {
    const username = input.value.trim();
    if (!username) return;
    
    button.disabled = true;
    button.textContent = 'Loading...';
    
    await saveChessComUsername(username);
    await loadGamesForUser(username);
  };
  
  button.addEventListener('click', submitHandler);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitHandler();
    }
  });
  
  input.focus();
}


async function loadGamesForUser(username: string): Promise<void> {
  if (!modalElement) return;
  
  const body = modalElement.querySelector('.lichess4chess-modal-body');
  if (!body) return;
  
  body.innerHTML = '<div class="lichess4chess-loading">Loading games...</div>';
  
  const response = await getRecentGames(username, 1);
  
  if (!response.success || !response.data || response.data.length === 0) {
    body.innerHTML = `
      <div class="lichess4chess-error">
        ${response.error?.message || 'No games found'}
      </div>
      <div class="lichess4chess-change-user">
        <button id="lichess4chess-change-username">Change Username</button>
      </div>
    `;
    
    const changeBtn = body.querySelector('#lichess4chess-change-username');
    changeBtn?.addEventListener('click', showUsernameInput);
    return;
  }
  
  displayGames(response.data, username);
}

function displayGames(games: GameInfo[], username: string): void {
  if (!modalElement) return;
  
  const body = modalElement.querySelector('.lichess4chess-modal-body');
  if (!body) return;
  
  body.innerHTML = `
    <div class="lichess4chess-search">
      <input 
        type="text" 
        id="lichess4chess-search" 
        class="lichess4chess-input"
        placeholder="Search games..."
      />
    </div>
    <div class="lichess4chess-game-list" id="lichess4chess-game-list"></div>
    <div class="lichess4chess-change-user">
      <button id="lichess4chess-change-username">Change Username (${username})</button>
    </div>
  `;
  
  const gameList = body.querySelector('#lichess4chess-game-list');
  const searchInput = body.querySelector('#lichess4chess-search') as HTMLInputElement;
  const changeBtn = body.querySelector('#lichess4chess-change-username');
  
  const renderGames = (gamesToRender: GameInfo[]) => {
    if (!gameList) return;
    
    gameList.innerHTML = gamesToRender.map(game => `
      <div class="lichess4chess-game-item" data-game-id="${game.id}">
        <div class="lichess4chess-game-info">
          <div class="lichess4chess-game-players">
            ${game.white.username} (${game.white.rating}) vs ${game.black.username} (${game.black.rating})
          </div>
          <div class="lichess4chess-game-meta">
            ${game.timeControl} • ${game.endTime.toLocaleDateString()} ${game.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div class="lichess4chess-game-result">${game.result}</div>
      </div>
    `).join('');
    
    gameList.querySelectorAll('.lichess4chess-game-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        if (isLoadingGame) {
          return;
        }
        selectGame(gamesToRender[index]);
      });
    });
  };
  
  renderGames(games);
  

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = games.filter(game => 
      game.white.username.toLowerCase().includes(query) ||
      game.black.username.toLowerCase().includes(query) ||
      game.result.includes(query)
    );
    renderGames(filtered);
  });
  
  changeBtn?.addEventListener('click', showUsernameInput);
}

async function selectGame(game: GameInfo): Promise<void> {
  
  if (isLoadingGame) {
    console.log('Game is already being loaded, please wait...');
    return;
  }
  
  isLoadingGame = true;
  closeModal();
  
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'lichess4chess-loading-indicator';
  loadingDiv.textContent = 'Loading game into analysis...';
  document.body.appendChild(loadingDiv);
  
  try {
    console.log('[Lichess4Chess] Loading game:', {
      white: game.white.username,
      black: game.black.username,
      result: game.result
    });
    
    const success = await loadPgnIntoLichess(game.pgn);
    
    if (!success) {
      throw new Error('Failed to load PGN - all methods failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    loadingDiv.textContent = '✓ Game loaded successfully!';
    loadingDiv.className = 'lichess4chess-loading-indicator success';
    
    setTimeout(() => {
      loadingDiv.remove();
      isLoadingGame = false;
    }, 1500);
  } catch (error) {
    console.error('[Lichess4Chess] Error loading game:', error);
    loadingDiv.textContent = '✗ Error loading game. Check console for details.';
    loadingDiv.className = 'lichess4chess-loading-indicator error';
    
    setTimeout(() => {
      loadingDiv.remove();
      isLoadingGame = false;
    }, 3000);
  }
}

function closeModal(): void {
  if (modalElement) {
    modalElement.remove();
    modalElement = null;
  }
  isModalOpen = false;
}

