# 🚀 Lunar Compute Service - Microserviço de Cálculos Astronômicos

## 📋 Visão Geral

O **Lunar Compute Service** é um microserviço Python otimizado que roda cálculos astronômicos complexos, integrando-se ao Cosmic Space via API HTTP.

### Arquitetura
```
┌─────────────────────────────────────────────────────────┐
│         Cosmic Space (Next.js/React)                    │
│                                                         │
│  components/ → hooks/ → lib/lunar-compute-client.ts    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP POST
                     ▼
     ┌───────────────────────────────────────┐
     │  /api/compute/* (Route Handler)       │
     │  (Node.js Adapter)                    │
     └───────────┬─────────────────────────────┘
                 │ HTTP POST
                 ▼
     ┌───────────────────────────────────────┐
     │  Lunar Compute Service (Python)       │
     │  - FastAPI + ephem                    │
     │  - Port 8000                          │
     └───────────────────────────────────────┘
```

---

## 🔧 Instalação Local

### Pré-requisitos
- Python 3.11+
- pip ou poetry
- Docker (opcional, para containerização)

### Setup Desenvolvimento

```bash
# 1. Navegar para o diretório do serviço
cd services/lunar-compute

# 2. Criar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate  # macOS/Linux
# ou
venv\Scripts\activate  # Windows

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Rodar o serviço
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visite `http://localhost:8000/docs` para ver a documentação interativa (Swagger UI).

---

## 🐳 Uso com Docker

### Build da Imagem
```bash
docker build -t cosmic-lunar-compute:latest ./services/lunar-compute
```

### Rodar Container Isolado
```bash
docker run -p 8000:8000 \
  --name cosmic-lunar-compute \
  cosmic-lunar-compute:latest
```

### Usar Docker Compose (Recomendado)
```bash
# Subir todos os serviços (lunar-compute + postgres + redis)
docker-compose up -d

# Ver logs
docker-compose logs -f lunar-compute

# Parar serviços
docker-compose down
```

---

## 📡 Endpoints da API

### 1. Health Check
```http
GET /health

Response:
{
  "status": "ok",
  "service": "lunar-compute",
  "version": "1.0.0"
}
```

### 2. Calcular Fase Lunar (Simples)
```http
POST /api/lunar-phase

Request:
{
  "date": "2025-01-14T10:30:00Z",
  "include_zodiac": true
}

Response:
{
  "date": "2025-01-14T10:30:00Z",
  "phase": "waxing_crescent",
  "illumination": 0.25,
  "phase_fraction": 0.15,
  "age_days": 4.43,
  "is_waxing": true,
  "zodiac_sign": "Capricórnio",
  "zodiac_emoji": "🐐"
}
```

### 3. Calcular Múltiplas Fases (Batch)
```http
POST /api/lunar-batch

Request:
{
  "dates": [
    "2025-01-14T10:30:00Z",
    "2025-02-14T10:30:00Z",
    "2025-03-14T10:30:00Z"
  ],
  "include_zodiac": true
}

Response:
[
  { ... },
  { ... },
  { ... }
]
```

**Limite**: Máximo 365 datas por request

### 4. Lunações de um Ano
```http
POST /api/lunations-year?year=2025

Response:
{
  "year": 2025,
  "count": 13,
  "lunations": [
    {
      "lunation_date": "2025-01-29T12:35:00Z",
      "moon_phase": "new",
      "illumination": 0,
      "age_days": 0,
      "zodiac_sign": "Aquário",
      "zodiac_emoji": "🌊"
    },
    ...
  ]
}
```

### 5. Signo Zodiacal
```http
POST /api/zodiac-sign?date=2025-01-14T10:30:00Z

Response:
{
  "date": "2025-01-14T10:30:00Z",
  "zodiac_sign": "Capricórnio",
  "zodiac_emoji": "🐐"
}
```

---

## 💻 Uso no Frontend (Next.js)

### Importar o Client
```typescript
import { lunarComputeClient } from '@/lib/lunar-compute-client';
```

### Exemplo: Componente React
```typescript
'use client';

import { useEffect, useState } from 'react';
import { lunarComputeClient } from '@/lib/lunar-compute-client';

export function MoonPhaseDisplay() {
  const [phase, setPhase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhase = async () => {
      try {
        const result = await lunarComputeClient.getLunarPhase(new Date(), {
          includeZodiac: true,
        });
        setPhase(result);
      } catch (error) {
        console.error('Erro ao buscar fase lunar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhase();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>{phase?.zodiac_emoji} {phase?.zodiac_sign}</h2>
      <p>Phase: {phase?.phase}</p>
      <p>Illumination: {Math.round(phase?.illumination * 100)}%</p>
    </div>
  );
}
```

### Usar Via API Route
```typescript
// No frontend, chamar a rota adapter do Next.js
const response = await fetch('/api/compute/lunar-phase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: new Date().toISOString(),
    includeZodiac: true,
  }),
});

const data = await response.json();
```

---

## ⚙️ Variáveis de Ambiente

### .env.local (Development)
```env
# Python Lunar Compute Service
LUNAR_COMPUTE_URL=http://localhost:8000

# Database (opcional)
POSTGRES_PASSWORD=dev_password
```

### .env.production
```env
# Production
LUNAR_COMPUTE_URL=https://compute-api.cosmic-space.app

# Database
POSTGRES_PASSWORD=${SECURE_POSTGRES_PASSWORD}
```

---

## 🧪 Testes

### Testar Health Check
```bash
curl http://localhost:8000/health
```

### Testar Cálculo Simples
```bash
curl -X POST http://localhost:8000/api/lunar-phase \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-14T10:30:00Z",
    "include_zodiac": true
  }'
```

### Testar Batch
```bash
curl -X POST http://localhost:8000/api/lunar-batch \
  -H "Content-Type: application/json" \
  -d '{
    "dates": ["2025-01-14T10:30:00Z", "2025-02-14T10:30:00Z"],
    "include_zodiac": true
  }'
```

---

## 📊 Performance

### Benchmarks Esperados
- **Lunar Phase (1 data)**: ~50-100ms
- **Lunar Batch (365 datas)**: ~5-10 segundos
- **Lunations Year**: ~2-3 segundos

### Otimizações
- ✅ Caching automático nas rotas (1-24 horas)
- ✅ Batch processing para reduzir requisições
- ✅ ephem compilado em C (rápido)
- ✅ Sem estado compartilhado entre requests

---

## 🚨 Troubleshooting

### Serviço Python não inicia
```bash
# Verificar erro
docker-compose logs lunar-compute

# Reconstruir
docker-compose build --no-cache lunar-compute
docker-compose up lunar-compute
```

### Timeout nas requisições
- Aumentar `timeout` no `LunarComputeClient`
- Reduzir tamanho do batch
- Verificar CPU/memória disponível

### Erro "Connection refused"
```bash
# Verificar se serviço está rodando
docker-compose ps lunar-compute

# Testar conexão
curl -v http://localhost:8000/health
```

---

## 📦 Deployment em Produção

### Railway / Render
```yaml
# railway.yml ou render.yml
services:
  lunar-compute:
    build:
      context: ./services/lunar-compute
    port: 8000
    env:
      - PYTHONUNBUFFERED=1
```

### Vercel (Edge Middleware)
Para máxima performance, integrar como worker edge usando Workers do edge runtime.

### Docker Hub
```bash
docker build -t seu-usuario/cosmic-lunar-compute:latest ./services/lunar-compute
docker push seu-usuario/cosmic-lunar-compute:latest
```

---

## 📚 Referências

- **ephem**: https://pypi.org/project/ephem/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Julian Day**: https://en.wikipedia.org/wiki/Julian_day

---

## 🤝 Contribuindo

Para adicionar novos endpoints ou algoritmos:

1. Editar `services/lunar-compute/main.py`
2. Adicionar modelo Pydantic (se necessário)
3. Implementar função e endpoint
4. Testar com curl/Postman
5. Atualizar documentação

Exemplo novo endpoint:
```python
@app.post("/api/lunar-distance")
async def get_lunar_distance(date: str):
    """Distância da Lua em km"""
    dt = parse_iso_datetime(date)
    observer = ephem.Observer()
    observer.date = dt
    moon = ephem.Moon(observer)
    return {
        "date": date,
        "distance_km": float(moon.earth_distance * 149597870.7)  # Convert AU to km
    }
```

---

**Última atualização**: 14 de janeiro de 2026
