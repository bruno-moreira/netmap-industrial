# NetMap Industrial

Sistema de mapeamento de rede industrial: switches, portas, VLANs e equipamentos.

## Estrutura do repositório

```text
api_network/
├── backend/          # API Node.js + Express + PostgreSQL
├── frontend/         # Interface React + Vite + Tailwind
├── docker-compose.yml
└── docs/             # (planejamento na raiz)
    ├── NetMap_Industrial.md
    ├── REFACTOR_PLAN.md
    └── ROTEIRO_REPLICACAO.md
```

## Início rápido

### 1. Instalar dependências

```bash
npm run install:all
# ou
cd backend && npm install
cd ../frontend && npm install
```

### 2. Banco de dados

```bash
# Docker (só Postgres)
docker compose up -d db

# SQL manual
psql -U postgres -f backend/db/create_database.sql
psql -U postgres -d netmap -f backend/db/bd.sql
```

### 3. Configurar API

```bash
cp backend/.env_example backend/.env
# Edite backend/.env se necessário
```

### 4. Rodar em desenvolvimento

Terminal 1 — API:

```bash
cd backend && npm run dev
```

Terminal 2 — Frontend:

```bash
cd frontend && npm run dev
```

Ou da raiz:

```bash
npm run dev:api    # backend
npm run dev:web    # frontend
```

| Serviço | URL |
|---------|-----|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |
| Frontend | http://localhost:5173 |

### Docker (tudo junto)

```bash
docker compose up --build
```

## Testes (backend)

```bash
cd backend && npm test
# ou na raiz:
npm test
```

## Documentação

- `NetMap_Industrial.md` — visão do produto
- `REFACTOR_PLAN.md` — domínio e fases
- `ROTEIRO_REPLICACAO.md` — padrões de arquitetura
- `backend/MIGRATIONS.md` — banco e Knex
# netmap-industrial
