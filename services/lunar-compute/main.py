#!/usr/bin/env python3
"""
Microserviço de Cálculos Astronômicos
Otimizado em Python com biblioteca ephem para máxima precisão e performance.

Uso:
  uvicorn main:app --host 0.0.0.0 --port 8000
  
Endpoints:
  POST /api/lunar-phase - Calcular fase lunar para uma data
  POST /api/lunar-batch - Calcular múltiplas fases em batch
  POST /api/lunations-year - Todas as lunações de um ano
  POST /api/zodiac-sign - Signo zodiacal aproximado
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import ephem
import math
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Cosmic Space - Lunar Compute Service",
    description="Microserviço de cálculos astronômicos otimizado em Python",
    version="1.0.0"
)

# CORS para comunicação com Node.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Modelos Pydantic
# ============================================================================

class LunarPhaseRequest(BaseModel):
    date: str = Field(..., description="Data ISO 8601: 2025-01-14T10:30:00Z")
    include_zodiac: bool = False

class LunarBatchRequest(BaseModel):
    dates: List[str] = Field(..., description="Lista de datas ISO 8601")
    include_zodiac: bool = False

class LunarPhaseResponse(BaseModel):
    date: str
    phase: str  # 'new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'
    illumination: float  # 0-1
    phase_fraction: float  # 0-1
    age_days: float  # dias desde lua nova
    is_waxing: bool
    zodiac_sign: Optional[str] = None
    zodiac_emoji: Optional[str] = None

class LunationData(BaseModel):
    lunation_date: str
    moon_phase: str
    illumination: float
    age_days: float
    zodiac_sign: str
    zodiac_emoji: str

class LunationsYearResponse(BaseModel):
    year: int
    count: int
    lunations: List[LunationData]

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

# ============================================================================
# Constantes Astronômicas
# ============================================================================

SYNODIC_MONTH = 29.53058867  # Período sinódico médio em dias
NEW_MOON_REFERENCE = datetime(2000, 1, 6, 18, 14, 0)  # Referência conhecida

ZODIAC_SIGNS = [
    ("Capricórnio", "♑", 20),
    ("Aquário", "♒", 19),
    ("Peixes", "♓", 21),
    ("Áries", "♈", 20),
    ("Touro", "♉", 21),
    ("Gêmeos", "♊", 21),
    ("Câncer", "♋", 23),
    ("Leão", "♌", 23),
    ("Virgem", "♍", 23),
    ("Libra", "♎", 23),
    ("Escorpião", "♏", 22),
    ("Sagitário", "♐", 22),
]

ZODIAC_EMOJIS = {
    "Capricórnio": "🐐",
    "Aquário": "🌊",
    "Peixes": "🐟",
    "Áries": "♈",
    "Touro": "🐂",
    "Gêmeos": "👯",
    "Câncer": "🦀",
    "Leão": "🦁",
    "Virgem": "👰",
    "Libra": "⚖️",
    "Escorpião": "🦂",
    "Sagitário": "🏹",
}

PHASE_NAMES = {
    0: "new",
    1: "waxing_crescent",
    2: "first_quarter",
    3: "waxing_gibbous",
    4: "full",
    5: "waning_gibbous",
    6: "last_quarter",
    7: "waning_crescent",
}

# ============================================================================
# Utilitários de Cálculo
# ============================================================================

def parse_iso_datetime(iso_string: str) -> datetime:
    """Parse de data ISO 8601"""
    try:
        if iso_string.endswith('Z'):
            iso_string = iso_string[:-1] + '+00:00'
        return datetime.fromisoformat(iso_string)
    except Exception as e:
        logger.error(f"Erro ao parsear data: {iso_string}, erro: {e}")
        raise ValueError(f"Data inválida: {iso_string}")

def calculate_lunar_phase(date: datetime) -> Dict:
    """
    Calcula fase lunar precisa usando ephem
    Retorna: illumination (0-1), age_days, phase (0-7)
    """
    # Criar observer (localização não importa para fase)
    observer = ephem.Observer()
    observer.date = date
    
    # Calcular fase lunar
    moon = ephem.Moon(observer)
    prev_new = ephem.previous_new_moon(observer.date)
    next_new = ephem.next_new_moon(observer.date)
    
    # Idade da lua em dias
    age_days = float((observer.date - prev_new) * 24 * 60 * 60 / (24 * 60 * 60))
    
    # Iluminação (0-1)
    illumination = float(moon.phase) / 100.0
    
    # Fração normalizada (0-1)
    phase_fraction = age_days / SYNODIC_MONTH
    
    # Determinar nome da fase (0-7)
    phase_index = int((phase_fraction % 1.0) * 8)
    phase_name = PHASE_NAMES.get(phase_index, "new")
    
    # Está em fase crescente?
    is_waxing = phase_fraction % 1.0 < 0.5
    
    return {
        "illumination": illumination,
        "age_days": age_days,
        "phase_fraction": phase_fraction % 1.0,
        "phase_name": phase_name,
        "is_waxing": is_waxing,
    }

def calculate_zodiac_sign(date: datetime) -> tuple[str, str]:
    """
    Calcula signo zodiacal aproximado baseado na data.
    Nota: Não é astrologia precisa, apenas aproximação por data do mês.
    """
    day = date.day
    month = date.month
    
    # Determinar signo pelo mês
    sign_index = (month - 1) % 12
    if month == 1:
        sign_index = 0 if day < 20 else 11  # Cap ou Sag
    elif month == 2:
        sign_index = 0 if day < 19 else 1   # Cap ou Aqu
    else:
        sign_index = (month - 1) % 12
        # Aplicar cutoff do dia
        cutoff = ZODIAC_SIGNS[sign_index][2]
        if day >= cutoff:
            sign_index = (sign_index + 1) % 12
    
    sign_name = ZODIAC_SIGNS[sign_index][0]
    emoji = ZODIAC_EMOJIS.get(sign_name, "?")
    
    return sign_name, emoji

# ============================================================================
# Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        service="lunar-compute",
        version="1.0.0"
    )

@app.post("/api/lunar-phase", response_model=LunarPhaseResponse)
async def get_lunar_phase(request: LunarPhaseRequest):
    """
    Calcula fase lunar para uma data específica.
    
    Exemplo:
    {
      "date": "2025-01-14T10:30:00Z",
      "include_zodiac": true
    }
    """
    try:
        date = parse_iso_datetime(request.date)
        lunar = calculate_lunar_phase(date)
        
        response = LunarPhaseResponse(
            date=request.date,
            phase=lunar["phase_name"],
            illumination=lunar["illumination"],
            phase_fraction=lunar["phase_fraction"],
            age_days=lunar["age_days"],
            is_waxing=lunar["is_waxing"],
        )
        
        if request.include_zodiac:
            sign, emoji = calculate_zodiac_sign(date)
            response.zodiac_sign = sign
            response.zodiac_emoji = emoji
        
        logger.info(f"✅ Lunar phase calculated for {request.date}")
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao calcular fase lunar: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/lunar-batch", response_model=List[LunarPhaseResponse])
async def get_lunar_batch(request: LunarBatchRequest):
    """
    Calcula fases lunares para múltiplas datas em batch.
    Otimizado para performance.
    
    Exemplo:
    {
      "dates": ["2025-01-14T10:30:00Z", "2025-02-14T10:30:00Z"],
      "include_zodiac": true
    }
    """
    try:
        results = []
        
        for iso_date in request.dates:
            date = parse_iso_datetime(iso_date)
            lunar = calculate_lunar_phase(date)
            
            response = LunarPhaseResponse(
                date=iso_date,
                phase=lunar["phase_name"],
                illumination=lunar["illumination"],
                phase_fraction=lunar["phase_fraction"],
                age_days=lunar["age_days"],
                is_waxing=lunar["is_waxing"],
            )
            
            if request.include_zodiac:
                sign, emoji = calculate_zodiac_sign(date)
                response.zodiac_sign = sign
                response.zodiac_emoji = emoji
            
            results.append(response)
        
        logger.info(f"✅ Processed {len(results)} lunar phases in batch")
        return results
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao processar batch: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/lunations-year", response_model=LunationsYearResponse)
async def get_lunations_year(year: int):
    """
    Retorna todas as lunações de um ano.
    Uma lunação é aproximadamente a duração da lua nova até a próxima lua nova.
    
    Exemplo:
    POST /api/lunations-year?year=2025
    """
    try:
        observer = ephem.Observer()
        lunations = []
        
        # Iterar ano inteiro
        start_date = ephem.Date(f"{year}/1/1")
        end_date = ephem.Date(f"{year}/12/31")
        
        current_date = start_date
        
        while current_date < end_date:
            # Encontrar próxima lua nova
            next_new = ephem.next_new_moon(current_date)
            
            if next_new > end_date:
                break
            
            # Converter para datetime
            new_moon_datetime = ephem.Date(next_new).datetime()
            
            # Calcular dados
            lunar = calculate_lunar_phase(new_moon_datetime)
            sign, emoji = calculate_zodiac_sign(new_moon_datetime)
            
            lunation = LunationData(
                lunation_date=new_moon_datetime.isoformat() + "Z",
                moon_phase="new",
                illumination=0,
                age_days=0,
                zodiac_sign=sign,
                zodiac_emoji=emoji
            )
            
            lunations.append(lunation)
            current_date = next_new + 1  # Próximo dia
        
        logger.info(f"✅ Generated {len(lunations)} lunations for year {year}")
        
        return LunationsYearResponse(
            year=year,
            count=len(lunations),
            lunations=lunations
        )
        
    except Exception as e:
        logger.error(f"Erro ao gerar lunações: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/zodiac-sign")
async def get_zodiac_sign(date: str):
    """
    Retorna signo zodiacal para uma data.
    
    Exemplo:
    POST /api/zodiac-sign?date=2025-01-14T10:30:00Z
    """
    try:
        dt = parse_iso_datetime(date)
        sign, emoji = calculate_zodiac_sign(dt)
        return {
            "date": date,
            "zodiac_sign": sign,
            "zodiac_emoji": emoji
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao calcular signo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
