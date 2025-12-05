#!/bin/bash
# QUICKSTART - Garagem Inteligente Full-Stack
# Execute este arquivo para iniciar o projeto rapidamente

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║  🏎️  GARAGEM INTELIGENTE - QUICKSTART                    ║"
echo "║                                                           ║"
echo "║  Full-Stack: Node.js + MongoDB + Express                 ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Verificando pré-requisitos...${NC}\n"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "Instale Node.js em: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js${NC}: $(node -v)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm${NC}: $(npm -v)"

echo ""
echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Iniciando servidor...${NC}\n"

# Exibir informações
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🎯 Servidor iniciando...${NC}"
echo -e "${YELLOW}📡 Acesse: http://localhost:3001${NC}"
echo -e "${YELLOW}🌐 Interface: http://localhost:3001/public/index-fullstack.html${NC}"
echo -e "${YELLOW}📊 Banco: MongoDB${NC}"
echo -e "${YELLOW}🚪 Porta: 3001${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}\n"

# Iniciar servidor
npm start

exit 0
