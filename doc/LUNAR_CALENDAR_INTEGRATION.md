# Guia de Integração - Calendário Lunar

## 📌 Quick Start

### 1. Verificar que os componentes existem
```bash
ls components/lunar-calendar/
# → index.ts, types.ts, utils.ts, *.tsx, styles/*.css
```

### 2. Acessar a página
```
http://localhost:3000/calendarioc
```

### 3. Customizar dados lunares

#### Opção A: Usar dados simulados (demo)
```tsx
import { generateMockLunarData } from '@/components/lunar-calendar';

const lunarData = generateMockLunarData(2025, 11); // dez/2025
```

#### Opção B: Integrar com API real
```tsx
// /app/api/lunar-data/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  // Buscar dados do banco (Neon, Supabase, etc)
  const data = await db.query(`
    SELECT date, phase, illumination, phase_name
    FROM lunar_phases
    WHERE EXTRACT(MONTH FROM date) = $1
      AND EXTRACT(YEAR FROM date) = $2
  `, [month, year]);

  return Response.json({
    month,
    year,
    byDate: transformToByDate(data) // formato esperado
  });
}
```

### 4. Conectar com banco de dados
```tsx
// Em calendarioc/page.tsx
useEffect(() => {
  fetch(`/api/lunar-data?month=${month}&year=${year}`)
    .then(res => res.json())
    .then(data => setLunarData(data.byDate));
}, [month, year]);
```

## 🎨 Personalizações Comuns

### Mudar cores
Edite `components/lunar-calendar/styles/LunarCalendarWidget.module.css`

### Adicionar evento ao selecionar dia
```tsx
const handleSelectDate = (date: Date) => {
  setSelectedDate(date);
  // Seu código aqui
  console.log('Dia selecionado:', date);
};
```

### Exibir fase em texto customizado
```tsx
// LunarHero.tsx linha 45
<h3 className={styles.phaseName}>
  {lunarData?.phaseName || 'Sem dados'}
</h3>
```

## 🔗 Estrutura de Dados Esperada

```typescript
{
  "2025-12-28": {
    "phase": "full" | "new" | "waxing_crescent" | ... ,
    "illumination": 0-100,  // number
    "phaseName": "Lua Cheia",  // string legível
    "daysInPhase": 3,  // opcional
    "nextPhaseDate": "2026-01-04"  // opcional
  }
}
```

## 🧪 Teste Local

```bash
# Abrir no navegador
npm run dev
# → http://localhost:3000/calendarioc

# Testar interações:
# 1. Clique em um dia
# 2. Use setas para navegar meses
# 3. Clique em "Hoje" para voltar ao presente
# 4. Verifique acessibilidade (Tab, Enter)
```

## 📊 Dados Lunares (Exemplo de API)

Se precisar retornar dados reais, use uma biblioteca como **ephem** (Python):

```python
# Backend para calcular fases lunares
import ephem
from datetime import datetime

def get_lunar_phases(year, month):
    date = ephem.Date(f'{year}/{month}/1')
    phases = {}
    
    # Simular para todo o mês
    for day in range(1, 32):
        try:
            moon = ephem.Moon(f'{year}/{month}/{day}')
            illumination = moon.phase  # 0-100
            
            phases[f'{year}-{month:02d}-{day:02d}'] = {
                'illumination': illumination,
                'phase': determine_phase(illumination),
                'phaseName': get_phase_name(illumination)
            }
        except:
            break
    
    return phases
```

## 🎯 Props Principais

| Prop | Tipo | Descrição |
|------|------|-----------|
| `month` | number | 0-11 (jan-dez) |
| `year` | number | 2024, 2025, ... |
| `selectedDate` | Date | Data selecionada |
| `onSelectDate` | function | Callback ao selecionar |
| `lunarDataByDate` | object | Dados lunares por data |
| `onMonthChange` | function | Callback ao navegar mês |
| `locale` | string | 'pt-BR' ou 'en-US' |

## 🚀 Deploy

Componente **não tem dependências externas** além de React. Pronto para:
- ✅ Vercel
- ✅ Netlify
- ✅ Any Next.js host

## 📞 Suporte

Dúvidas sobre:
- **Props e tipos**: veja `components/lunar-calendar/types.ts`
- **Estilos**: edite `components/lunar-calendar/styles/*.css`
- **Lógica**: veja `components/lunar-calendar/utils.ts`
- **Hooks**: veja `app/calendarioc/page.tsx`

---

**Pronto!** O calendário está funcional e customizável. 🌙
