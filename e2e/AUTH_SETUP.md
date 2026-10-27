# Como Configurar Autenticação do Chess.com para Testes

## Por que isso é necessário?

Muitos jogos do Chess.com requerem login para acessar. Para testar a extensão completamente, precisamos injetar os cookies de autenticação do seu navegador.

## 🚀 Método Rápido (Recomendado)

### Use o Script Automático

1. **Faça login no Chess.com** no Chrome
2. **Abra o DevTools** (F12)
3. **Vá para a aba Console**
4. **Abra o arquivo** `e2e/extract-cookies.js` e copie todo o conteúdo
5. **Cole e execute** no Console
6. **O script extrai os cookies automaticamente** e gera a configuração
7. **Copie a saída** para `e2e/auth.config.ts`
8. **Atualize seu username** no arquivo

```javascript
// O script vai gerar algo assim:
export const authConfig: ChessComAuthConfig = {
  cookies: [
    {
      name: 'cookie2',
      value: 'abc123...', // Valor real extraído
      domain: '.chess.com',
      path: '/',
    },
  ],
  username: 'YOUR_CHESS_COM_USERNAME', // Altere isso!
};
```

---

## 📝 Método Manual (Passo a Passo)

### 1. Faça login no Chess.com no Chrome

Abra o Chrome e faça login normalmente em https://www.chess.com

### 2. Abra o DevTools

- Pressione `F12` ou `Ctrl+Shift+I` (Windows/Linux)
- Ou clique com botão direito > "Inspecionar"

### 3. Navegue até os Cookies

1. Clique na aba **Application** (ou **Aplicativo**)
2. No menu lateral esquerdo, expanda **Cookies**
3. Clique em `https://www.chess.com`

### 4. Copie os Cookies Necessários

Você verá uma lista de cookies. Procure e copie os valores destes:

**Cookies Principais (NECESSÁRIOS):**
- `cookie2` - Cookie de autenticação principal
- Qualquer cookie com "session" no nome

**Cookies Opcionais:**
- `_ga`, `_gid` - Analytics (não críticos)
- `cf_clearance` - Cloudflare (pode ser necessário)

### 5. Configure o arquivo auth.config.ts

Abra `e2e/auth.config.ts` e preencha:

```typescript
export const authConfig: ChessComAuthConfig = {
  cookies: [
    {
      name: 'cookie2',
      value: 'cole_o_valor_aqui', // Cole o valor do cookie
      domain: '.chess.com',
      path: '/',
    },
    {
      name: 'sessionid', // ou 'session_id', veja o nome exato
      value: 'cole_o_valor_aqui',
      domain: '.chess.com',
      path: '/',
    },
  ],
  username: 'seu_username_chess_com', // Seu username
};
```

### 6. Teste a Configuração

```bash
npm run test:e2e
```

Se configurado corretamente, você verá:
```
✅ Injected Chess.com authentication cookies
```

## Dicas

- **Cookies expiram**: Se os testes começarem a falhar depois de alguns dias, atualize os cookies
- **Segurança**: O arquivo `auth.config.ts` está no `.gitignore` e NÃO será commitado
- **Formato**: Certifique-se de copiar o valor completo do cookie (pode ser longo)
- **Domain**: Mantenha `.chess.com` com o ponto no início

## Exemplo Visual

```
DevTools > Application > Cookies > https://www.chess.com

Name        | Value
------------|------------------
cookie2     | abc123xyz...     <- COPIE ESTE VALOR
sessionid   | def456uvw...     <- COPIE ESTE VALOR
_ga         | GA1.2.123...     (opcional)
```

## Alternativa: Testes Sem Login

Se preferir não usar cookies:
1. Delete ou deixe `auth.config.ts` vazio
2. Os testes tentarão usar jogos públicos arquivados
3. Alguns testes podem falhar (esperado)

## Solução de Problemas

### "Could not load cookies"
- Verifique se o arquivo `e2e/auth.config.ts` existe
- Verifique a sintaxe do TypeScript (vírgulas, aspas)

### Testes ainda falham com cookies
- Verifique se os valores dos cookies estão completos
- Tente adicionar mais cookies do DevTools
- Verifique se seu username está correto

### Cookies expiram muito rápido
- Alguns cookies duram apenas horas
- Mantenha uma sessão ativa do Chess.com aberta
- Re-copie os cookies quando necessário
