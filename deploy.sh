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

# 1. Detectar o comando correto do Docker Compose (v2 plugin ou v1 standalone)
DOCKER_CMD=""

if docker compose version &> /dev/null; then
    DOCKER_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker-compose"
else
    echo -e "${RED}Erro: Nem 'docker compose' nem 'docker-compose' foram encontrados no servidor.${NC}"
    echo -e "${YELLOW}Por favor instale o Docker Compose no servidor antes de continuar.${NC}"
    exit 1
fi

echo -e "${GREEN}Usando comando de implantação:${NC} $DOCKER_CMD"

# 2. Verificar se o arquivo de ambiente .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Criando arquivo de configuração .env a partir de .env_example...${NC}"
    cp .env_example .env
fi

# Carregar variáveis do .env
export $(grep -v '^#' .env | xargs) 2>/dev/null || true
PORT_USED="${SYSTEM_PORT:-8082}"

# 3. Escolher o arquivo compose (Produção com Nginx Gateway se existir, ou padrão)
COMPOSE_FILE_OPTION=""
if [ -f "docker-compose.prod.yml" ]; then
    COMPOSE_FILE_OPTION="-f docker-compose.prod.yml"
    echo -e "${CYAN}Modo Produção ativado com Nginx Single-Port Gateway (Porta Externa: ${PORT_USED})${NC}"
fi

# 4. Subir os contêineres em segundo plano (build + start)
echo -e "${CYAN}Construindo e iniciando contêineres Docker (DB, API, Gateway)...${NC}"
$DOCKER_CMD $COMPOSE_FILE_OPTION up -d --build

# 5. Aguardar a API ficar 100% pronta e conectada ao Banco
echo -e "${YELLOW}Aguardando serviços ficarem totalmente operacionais...${NC}"
MAX_RETRIES=20
COUNT=0
until $DOCKER_CMD $COMPOSE_FILE_OPTION exec -T api wget -qO- http://127.0.0.1:3002/health &> /dev/null || [ $COUNT -eq $MAX_RETRIES ]; do
    echo -e "${YELLOW}Conectando ao contêiner da API... (Tentativa $((COUNT+1))/${MAX_RETRIES})${NC}"
    sleep 3
    COUNT=$((COUNT+1))
done

# 6. Executar Migrações e Seeds no banco
echo -e "${CYAN}Populando tabelas e criando usuário inicial admin...${NC}"
$DOCKER_CMD $COMPOSE_FILE_OPTION exec -T api npm run migrate:latest
$DOCKER_CMD $COMPOSE_FILE_OPTION exec -T api npm run seed:run

echo -e "${GREEN}======================================================"
echo -e " ✅ NetMap Industrial Implantado com Sucesso!"
echo -e "======================================================${NC}"
echo -e "${CYAN}Serviços disponíveis:${NC}"

if [ -f "docker-compose.prod.yml" ]; then
    echo -e "  • Aplicação (Gateway Nginx): ${GREEN}http://<IP-DO-SERVIDOR>:${PORT_USED}${NC}"
    echo -e "  • API Backend (Proxy Nginx): ${GREEN}http://<IP-DO-SERVIDOR>:${PORT_USED}/api${NC}"
    echo -e "  • Documentação API Swagger:  ${GREEN}http://<IP-DO-SERVIDOR>:${PORT_USED}/docs${NC}"
else
    echo -e "  • Frontend Web:  ${GREEN}http://<IP-DO-SERVIDOR>:5173${NC}"
    echo -e "  • API Backend:   ${GREEN}http://<IP-DO-SERVIDOR>:3002${NC}"
    echo -e "  • Documentação:  ${GREEN}http://<IP-DO-SERVIDOR>:3002/docs${NC}"
fi

echo -e ""
echo -e "${CYAN}Usuários Padrão para Login:${NC}"
echo -e "  • Email: ${GREEN}admin@empresa-exemplo.com${NC} | Senha: ${GREEN}admin123${NC}"
echo -e "  • Email: ${GREEN}root@netmap.local${NC}          | Senha: ${GREEN}root123${NC}"
echo -e ""
echo -e "${YELLOW}Para monitorar os logs:${NC} $DOCKER_CMD $COMPOSE_FILE_OPTION logs -f"
echo -e "${YELLOW}Para parar os serviços:${NC} $DOCKER_CMD $COMPOSE_FILE_OPTION down"
echo -e "${GREEN}======================================================${NC}"
