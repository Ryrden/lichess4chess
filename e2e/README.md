# E2E Tests - Lichess4Chess

Testes end-to-end usando Playwright para validar a extensão em um navegador real.

## 📁 Estrutura

```
e2e/
├── fixtures/
│   └── extension.ts       # Fixture customizado para carregar a extensão
├── helpers/
│   ├── auth.ts           # Helpers de autenticação
│   └── chesscom.ts       # Helpers do Chess.com
├── analyze-flow.spec.ts  # Testes principais
├── auth.config.ts        # Configuração de cookies (gitignored)
├── auth.config.example.ts # Template de configuração
├── extract-cookies.js    # Script helper para extrair cookies
└── AUTH_SETUP.md         # Guia completo de configuração

dist_chrome/              # Build da extensão (requerido)
```

## 🚀 Quick Start

### 1. Configure Autenticação

```bash
# Edite e2e/auth.config.ts com seus cookies do Chess.com
# Veja AUTH_SETUP.md para instruções detalhadas
```

**Método Rápido:** Use `extract-cookies.js` no DevTools Console

### 2. Rode os Testes

```bash
npm run test:e2e          # Roda todos os testes
npm run test:e2e:ui       # Modo interativo (recomendado)
npm run test:e2e:debug    # Debug step-by-step
npm run test:e2e:headed   # Ver o navegador
npm run test:e2e:watch    # Ver navegador + workers=1 (melhor para debug)
```

### 3. Fixar a Extensão (Opcional)

Quando rodar testes em modo `headed`, você pode fixar a extensão:
1. Clique no ícone de puzzle 🧩 no canto superior direito
2. Encontre "Lichess4Chess" e clique no pin 📌
3. A extensão fica visível na toolbar

📖 **Guia completo:** [PINNING_EXTENSION.md](./PINNING_EXTENSION.md) 

```bash
npm run test:e2e          # Roda todos os testes
npm run test:e2e:ui       # Modo interativo (recomendado)
npm run test:e2e:debug    # Debug step-by-step
npm run test:e2e:headed   # Ver o navegador
```

### 3. Veja os Resultados

```bash
npx playwright show-report
```

## 🧪 Testes Implementados

### ✅ Extension State Detection
- **NOT_CHESS_SITE**: Detecta quando não está no Chess.com
- **Chess.com Homepage**: Popup funciona na página inicial

### ⚡ Main Flow (Requer Auth)
- **Popup State**: Verifica estado correto do popup
- **Open Lichess**: Clica no botão e abre análise no Lichess
  - Detecta jogo automaticamente
  - Extrai PGN
  - Importa para Lichess
  - Valida que análise carregou

## 🔧 Arquivos Importantes

### `auth.config.ts` (Você cria)
Contém seus cookies do Chess.com. **Não é commitado (gitignored)**.

```typescript
export const authConfig: ChessComAuthConfig = {
  cookies: [
    { name: 'cookie2', value: '...', domain: '.chess.com', path: '/' },
  ],
  username: 'seu_username',
};
```

### `extract-cookies.js` (Helper)
Execute no Console do Chrome enquanto logado no Chess.com.
Gera automaticamente a configuração de cookies.

### `AUTH_SETUP.md` (Guia)
Guia completo com instruções detalhadas e troubleshooting.

## ⚠️ Troubleshooting

### Testes Falhando
1. **Verifique auth.config.ts**: Cookies corretos?
2. **Verifique username**: Seu Chess.com username está correto?
3. **Cookies expirados?**: Re-extraia os cookies
4. **Build atualizado?**: Rode `npm run build:chrome`

### "Could not get valid game URL"
- Significa que não conseguiu encontrar um jogo para testar
- Configure `auth.config.ts` com seu login
- Ou ajuste as URLs de teste em `helpers/chesscom.ts`

### Extensão não carrega
- Verifique se `dist_chrome/` existe
- Rode `npm run build:chrome` antes dos testes

## 📖 Mais Informações

- [Playwright Docs](https://playwright.dev)
- [Testing Browser Extensions](https://playwright.dev/docs/chrome-extensions)
- [AUTH_SETUP.md](./AUTH_SETUP.md) - Guia completo de auth

## 💡 Dicas

- Use `test:e2e:ui` para ver o que está acontecendo
- Screenshots de falhas ficam em `test-results/`
- Relatório HTML em `playwright-report/`
- Testes rodam em modo headed (necessário para extensões)
- Um teste por vez (workers: 1) para evitar conflitos
