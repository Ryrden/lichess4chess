# Como Fixar a Extensão Durante os Testes

Quando você roda `npm run test:e2e:headed`, o navegador abre com a extensão carregada, mas ela não fica visível na barra superior por padrão.

## 🔧 Como Fixar a Extensão (Pin)

### Método 1: Durante o Teste (Rápido)

1. **Rode os testes em modo headed:**
   ```bash
   npm run test:e2e:headed
   ```

2. **Quando o navegador abrir:**
   - Olhe para o canto superior direito
   - Clique no ícone de **puzzle/quebra-cabeça** 🧩 (Extensions)
   - Encontre **Lichess4Chess** na lista
   - Clique no ícone de **pin 📌** ao lado do nome
   - A extensão agora aparece na toolbar

3. **Continue o teste:**
   - A extensão fica visível
   - Você pode clicar manualmente no ícone para abrir o popup
   - Os testes vão abrir o popup automaticamente via URL

### Método 2: Teste Manual Completo

Para testar clicando manualmente no ícone da extensão:

1. **Rode os testes em modo headed:**
   ```bash
   npm run test:e2e:headed
   ```

2. **Pause o navegador quando abrir:**
   - Os testes rodam, mas você tem alguns segundos
   - Fixe a extensão (método acima)

3. **Navegue manualmente:**
   - Vá para Chess.com
   - Abra um jogo
   - Clique no ícone da extensão
   - Clique em "Analyze on Lichess"
   - Verifique se Lichess abre

## 🎯 Por Que os Testes Não Clicam no Ícone?

Os testes automatizados do Playwright **não conseguem clicar no ícone da extensão** porque:

- O ícone fica na **toolbar do Chrome** (UI do navegador)
- Playwright só controla **páginas web**, não a UI do Chrome
- **Solução usada:** Abrimos o popup diretamente via URL `chrome-extension://{id}/popup.html`
  - É equivalente a clicar no ícone
  - Mais confiável e rápido
  - Mesmo resultado final

## 📸 Referência Visual

```
┌─────────────────────────────────────────────┐
│ Chrome Toolbar                              │
│  [← →] chess.com/game/...  [🧩] [TiredSWE]  │ 
│                              ↑               │
│                         Click aqui           │
│                    (Extensions Menu)         │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────┐
│ Extensions              │
│ ─────────────────────── │
│ Lichess4Chess      [📌] │ ← Click no pin
│ Other Extension    [📌] │
└─────────────────────────┘
```

Depois de fixar:

```
┌─────────────────────────────────────────────┐
│ Chrome Toolbar                              │
│  [← →] chess.com  [L4C] [🧩] [TiredSWE]     │
│                     ↑                        │
│              Extension agora visível!        │
└─────────────────────────────────────────────┘
```

## 💡 Dica Pro

Enquanto o teste roda em modo `--headed`, você pode:

1. **Ver o que está acontecendo** em tempo real
2. **Fixar a extensão** rapidamente
3. **Interagir manualmente** se quiser testar algo
4. **Deixar o teste continuar** automaticamente

Os testes continuam funcionando normalmente, você só tem visibilidade extra!

## ⚙️ Configuração Permanente

Infelizmente, o Playwright cria um **perfil temporário** do Chrome a cada execução, então:
- ❌ A extensão fixa não persiste entre testes
- ✅ Você precisa fixar novamente cada vez
- ✅ Mas leva apenas 2 segundos!

## 🚀 Scripts Disponíveis

```bash
# Roda testes e fecha navegador (headless simulado)
npm run test:e2e:headed

# Modo UI interativo (melhor para debug)
npm run test:e2e:ui

# Modo debug (step-by-step)
npm run test:e2e:debug

# Testes normais (pode não ver navegador)
npm run test:e2e
```
