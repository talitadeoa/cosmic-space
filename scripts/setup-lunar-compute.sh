#!/bin/bash

# Script de Setup do Lunar Compute Service
# Uso: ./scripts/setup-lunar-compute.sh

set -e

echo "🚀 Inicializando Lunar Compute Service..."

# 1. Criar diretório se não existir
if [ ! -d "services/lunar-compute" ]; then
    echo "❌ Diretório services/lunar-compute não encontrado"
    exit 1
fi

# 2. Verificar Python
if ! command -v python3.11 &> /dev/null; then
    echo "⚠️  Python 3.11 não encontrado. Instalando..."
    # Sugestão de instalação
    echo "   macOS: brew install python@3.11"
    echo "   Ubuntu: sudo apt-get install python3.11"
    exit 1
fi

echo "✅ Python 3.11 encontrado"

# 3. Criar ambiente virtual
cd services/lunar-compute

if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3.11 -m venv venv
fi

source venv/bin/activate

# 4. Instalar dependências
echo "📥 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

# 5. Testar importação
echo "🧪 Testando importações..."
python3 -c "import ephem; import fastapi; print('✅ Todas as dependências importadas com sucesso')"

# 6. Criar .env local se não existir
cd ../../

if [ ! -f ".env.local" ]; then
    echo "📝 Criando .env.local..."
    cat >> .env.local << EOF
# Lunar Compute Service
LUNAR_COMPUTE_URL=http://localhost:8000
NEXT_PUBLIC_LUNAR_COMPUTE_URL=http://localhost:8000
EOF
fi

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "1. Iniciar o serviço: cd services/lunar-compute && source venv/bin/activate && uvicorn main:app --reload"
echo "2. Ou usar Docker: docker-compose up lunar-compute"
echo "3. Docs interativa: http://localhost:8000/docs"
echo ""
