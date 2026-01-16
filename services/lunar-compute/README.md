# Lunar Compute Service

🚀 Microserviço Python otimizado para cálculos astronômicos do Cosmic Space.

## Quick Start

### Opção 1: Local (Desenvolvimento)
```bash
bash scripts/setup-lunar-compute.sh

cd services/lunar-compute
source venv/bin/activate
uvicorn main:app --reload
```

### Opção 2: Docker (Produção)
```bash
docker-compose up lunar-compute
```

Docs: http://localhost:8000/docs

## Endpoints Principais

- `POST /api/lunar-phase` - Fase lunar para uma data
- `POST /api/lunar-batch` - Múltiplas fases em batch
- `POST /api/lunations-year` - Todas lunações de um ano
- `POST /api/zodiac-sign` - Signo zodiacal

## Usar no Código

```typescript
import { lunarComputeClient } from '@/lib/lunar-compute-client';

const phase = await lunarComputeClient.getLunarPhase(new Date(), {
  includeZodiac: true,
});
```

## Documentação

- [LUNAR_COMPUTE_SERVICE.md](../doc/LUNAR_COMPUTE_SERVICE.md) - Docs completa
- [LUNAR_COMPUTE_EXAMPLES.ts](../doc/LUNAR_COMPUTE_EXAMPLES.ts) - 6 exemplos
- [IMPLEMENTACAO_LUNAR_COMPUTE.md](../doc/IMPLEMENTACAO_LUNAR_COMPUTE.md) - Guia de implementação

## Testes

```bash
node scripts/test-lunar-compute.mjs
```

## Performance

- **1 fase**: ~50-100ms
- **365 fases**: ~5-10s
- **+30-50% mais rápido** que JavaScript puro

---

**Status**: ✅ Pronto para usar
