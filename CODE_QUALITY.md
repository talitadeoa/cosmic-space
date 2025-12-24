# 🛠️ Guia de Code Quality - Cosmic Space

## ✅ O que foi instalado

### Pacotes
- **Prettier**: Formatação automática de código
- **ESLint v9**: Análise estática com regras rigorosas
- **Husky**: Git hooks para automação
- **TypeScript ESLint**: Suporte a TypeScript
- **ESLint Plugins**: React, JSX-a11y (acessibilidade)

### Arquivos Criados
- `.prettierrc.json` - Configuração do Prettier
- `.prettierignore` - Ignorar arquivos no Prettier
- `eslint.config.js` - Configuração expandida do ESLint
- `.husky/pre-commit` - Hook automático antes de commit
- `.github/workflows/quality.yml` - CI/CD automático

---

## 📚 Scripts Disponíveis

```bash
# Verificar problemas de linting
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix

# Formatar código com Prettier
npm run format

# Verificar formatação sem modificar
npm run format:check

# Build do projeto
npm run build
```

---

## 🎯 Regras Ativas

### ESLint
✅ **TypeScript Strict**
- Avoid `any` types
- No unused variables
- No non-null assertions

✅ **React/Next.js**
- React in JSX scope (off for React 17+)
- No prop-types (use TypeScript)

✅ **Acessibilidade (a11y)**
- Alt text em imagens
- Keyboard events com key listeners
- Interactive elements com roles

✅ **Code Quality**
- `console.log` apenas com warnings
- Prefer `const` over `let`
- `===` e `!==` (não use `==` e `!=`)
- No debugger statements

### Prettier
- **Semicolons**: ✓ Ativados
- **Single Quotes**: ✓ Usadas
- **Print Width**: 100 caracteres
- **Tabs**: 2 espaços
- **Trailing Commas**: ES5 style

---

## 🚀 Fluxo de Desenvolvimento

```
1. Você escreve código
   ↓
2. Faz commit: git commit -m "..."
   ↓
3. Husky roda automaticamente:
   - eslint . --fix (corrige problemas)
   ↓
4. Se tudo OK → commit é feito ✓
   Se houver erros → commit é bloqueado ❌
   ↓
5. Ao fazer push → GitHub Actions roda:
   - ESLint verificação
   - Prettier verificação
   - Build test
   - npm audit (segurança)
```

---

## 📊 Status Atual

```
✅ ESLint: 158 warnings (principalmente console.log e any types)
✅ Prettier: Código formatado
✅ Build: Funcionando
✅ Husky: Configurado
✅ GitHub Actions: Pronto
```

### Warnings Mais Comuns

1. **`@typescript-eslint/no-explicit-any`** → Use tipos específicos em vez de `any`
2. **`@typescript-eslint/no-unused-vars`** → Remova variáveis não usadas (ou prefixe com `_`)
3. **`no-console`** → Use `console.warn()` ou `console.error()` em produção
4. **`jsx-a11y/click-events-have-key-events`** → Adicione handlers de teclado

---

## 💡 Dicas

### Para usar variáveis não utilizadas de propósito
```typescript
// ❌ Ruim
const { unused, important } = props;

// ✅ Bom (prefixe com _)
const { _unused, important } = props;
```

### Para permitir console.log em arquivos específicos
```typescript
// No topo do arquivo
/* eslint-disable no-console */

console.log('Isso é permitido aqui');
```

### Para desabilitar Prettier em um arquivo
```
<!-- prettier-ignore -->
```

---

## 🔧 Customizações Futuras

Se quiser ajustar as regras:

### Remover warnings de `any`
Edit `eslint.config.js`:
```javascript
'@typescript-eslint/no-explicit-any': 'off', // ao invés de 'warn'
```

### Remover warnings de `console.log`
```javascript
'no-console': 'off', // ao invés de ['warn', ...]
```

### Mudar print width do Prettier
Edit `.prettierrc.json`:
```json
{
  "printWidth": 120  // ao invés de 100
}
```

---

## 📝 Próximos Passos (Opcionais)

- [ ] Adicionar SonarQube para análise completa
- [ ] Configurar pre-push hook (rodas testes)
- [ ] Adicionar commitlint para mensagens padronizadas
- [ ] Configurar coverage reports
- [ ] Add EditorConfig para consistency

---

## 🆘 Troubleshooting

### Prettier e ESLint em conflito?
```bash
npm run lint:fix && npm run format
```

### Husky não rodando em commits?
```bash
npx husky install
# Se ainda não funcionar, reinstale:
npm install husky --save-dev
npx husky init
```

### GitHub Actions falhando?
Verifique o arquivo `.github/workflows/quality.yml` e rode localmente:
```bash
npm run lint
npm run format:check
npm run build
```

---

## 📞 Comandos Úteis

```bash
# Ver detalhes de um arquivo específico
npm run lint -- app/page.tsx

# Formatar apenas componentes
npm run format -- components/

# Lint com output verboso
npm run lint -- --format=detailed

# Criar arquivo .eslintignore (se necessário)
echo "node_modules" > .eslintignore
```

---

**Criado em:** 24 de dezembro de 2025
**Versão:** 1.0.0
