#!/bin/bash
set -e

# ==============================================================================
# Script de Implantação Automatizada — NetMap Industrial
# Uso: ./deploy.sh
# ==============================================================================

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================"
echo -e " 🚀 Iniciando Implantação do NetMap Industrial"
echo -e "======================================================${NC}"

# 1. Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Erro: Docker não encontrado. Por favor instale o Docker antes de continuar.${NC}"
    exit 1
fi

# 2. Verificar arquivo de ambiente .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Criando arquivo de configuração .env a partir de .env_example...${NC}"
    cp .env_example .env
fi

# 3. Subir os contêineres em segundo plano (build + start)
echo -e "${CYAN}Construindo e iniciando contêineres Docker (DB, API, Frontend)...${NC}"
docker compose up -d --build

# 4. Aguardar o banco de dados e a API ficarem saudáveis
echo -e "${YELLOW}Aguardando inicialização do banco de dados e serviços...${NC}"
sleep 5

# 5. Executar Migrações e Seeds no banco
echo -e "${CYAN}Executando migrações e dados iniciais no banco de dados...${NC}"
docker compose exec -T api npm run migrate:latest || true
docker compose exec -T api npm run seed:run || true

echo -e "${GREEN}======================================================"
echo -e " ✅ NetMap Industrial Implantado com Sucesso!"
echo -e "======================================================${NC}"
echo -e "${CYAN}Serviços disponíveis:${NC}"
echo -e "  • Frontend Web:  ${GREEN}http://localhost:5173${NC} (ou IP do seu servidor)"
echo -e "  • API Backend:   ${GREEN}http://localhost:3002${NC}"
echo -e "  • Documentação:  ${GREEN}http://localhost:3002/docs${NC}"
echo -e ""
echo -e "${YELLOW}Para monitorar os logs:${NC} docker compose logs -f"
echo -e "${YELLOW}Para parar os serviços:${NC} docker compose down"
echo -e "======================================================"
