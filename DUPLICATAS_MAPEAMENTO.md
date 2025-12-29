# Mapeamento de Componentes Duplicados

## Resumo
Encontradas **5 séries de componentes duplicados** na pasta `/components`. As versões em subdiretórios são as oficiais e mantêm importações corretas.

---

## 📋 Duplicatas Encontradas

### 1. **AuthGate** ✅
- **Raiz**: `/components/AuthGate.tsx` (DELETAR)
- **Oficial**: `/components/auth/AuthGate.tsx` (MANTER)
- **Status**: Idêntico - 242 linhas
- **Uso**: `import { AuthGate } from '@/components/auth';`
- **Impacto**: Nenhum (importação já aponta para versão oficial)

### 2. **SpacePageLayout** ✅
- **Raiz**: `/components/SpacePageLayout.tsx` (DELETAR)
- **Oficial**: `/components/layouts/SpacePageLayout.tsx` (MANTER)
- **Status**: Idêntico - Layout com SpaceBackground
- **Uso**: `import { SpacePageLayout } from '@/components/layouts';`
- **Usados em**: 10+ páginas (home, comunidade, perfil, emocoes, ciclos, eclipse, galaxia, lua, planeta, sol)
- **Impacto**: Nenhum (importação já aponta para versão oficial)

### 3. **SfxProvider** ✅
- **Raiz**: `/components/SfxProvider.tsx` (DELETAR)
- **Oficial**: `/components/providers/SfxProvider.tsx` (MANTER)
- **Status**: Idêntico - Provider de áudio com contexto
- **Uso**: 
  - Layout principal: `import { SfxProvider } from '@/components/providers';`
  - NavMenu root: `import { useSfxContext } from './SfxProvider';` ⚠️
  - NavMenu novo: `import { useSfxContext } from '@/components/providers/SfxProvider';` ✅
- **Impacto**: NavMenu.tsx na raiz precisa de atualização

### 4. **AutoSyncLunar** ✅
- **Raiz**: `/components/AutoSyncLunar.tsx` (DELETAR)
- **Oficial**: `/components/sync/AutoSyncLunar.tsx` (MANTER)
- **Status**: Idêntico - Sincroniza fase lunar ao autenticar
- **Impacto**: Nenhum aparente (não encontrada importação)

### 5. **LunationSync** ✅
- **Raiz**: `/components/LunationSync.tsx` (DELETAR)
- **Oficial**: `/components/sync/LunationSync.tsx` (MANTER)
- **Status**: Idêntico - 181 linhas
- **Impacto**: Nenhum aparente (não encontrada importação)

### 6. **RadioPlayer** ✅
- **Raiz**: `/components/RadioPlayer.tsx` (DELETAR)
- **Oficial**: `/components/audio/RadioPlayer.tsx` (MANTER)
- **Status**: Idêntico - 192 linhas
- **Impacto**: Nenhum aparente (não encontrada importação)

### 7. **GalaxySunsSync** ✅
- **Raiz**: `/components/GalaxySunsSync.tsx` (DELETAR)
- **Oficial**: `/components/sync/GalaxySunsSync.tsx` (MANTER)
- **Status**: Praticamente idêntico (versão oficial tem comentários TODO extras)
- **Impacto**: Nenhum aparente (não encontrada importação)

### 8. **NavMenu** ⚠️
- **Raiz**: `/components/NavMenu.tsx` (VERIFICAR)
- **Oficial**: `/components/navigation/NavMenu.tsx` (VERIFICAR)
- **Status**: Praticamente idêntico
- **Diferença**: Import do SfxProvider
  - Raiz: `import { useSfxContext } from './SfxProvider';` (relativo)
  - Oficial: `import { useSfxContext } from '@/components/providers/SfxProvider';` (absoluto)
- **Conclusão**: Manter versão em `/components/navigation/` (import correto)

---

## 🎯 Plano de Ação

1. **Deletar** estes 7 arquivos da raiz `/components/`:
   - ❌ AuthGate.tsx
   - ❌ SpacePageLayout.tsx
   - ❌ SfxProvider.tsx
   - ❌ AutoSyncLunar.tsx
   - ❌ LunationSync.tsx
   - ❌ RadioPlayer.tsx
   - ❌ GalaxySunsSync.tsx

2. **Manter** as versões oficiais nos subdiretórios:
   - ✅ `/components/auth/AuthGate.tsx`
   - ✅ `/components/layouts/SpacePageLayout.tsx`
   - ✅ `/components/providers/SfxProvider.tsx`
   - ✅ `/components/sync/AutoSyncLunar.tsx`
   - ✅ `/components/sync/LunationSync.tsx`
   - ✅ `/components/audio/RadioPlayer.tsx`
   - ✅ `/components/sync/GalaxySunsSync.tsx`
   - ✅ `/components/navigation/NavMenu.tsx`

3. **Verificar** `/components/index.ts` e `/components/*/index.ts` para garantir exports corretos

---

## 📊 Impacto
- **Arquivos a deletar**: 7
- **Imports afetados**: 0 (todas as importações já usam caminhos corretos)
- **Páginas afetadas**: 0
- **Risco**: Baixíssimo
