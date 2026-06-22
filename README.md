# NetMap Industrial

Sistema de mapeamento de rede industrial avançado: gerenciamento de switches, portas (Access, Trunk, Hybrid), VLANs e equipamentos conectados.

## Estrutura do repositório

```text
netmap-industrial/
├── backend/          # API Node.js (ESM) + Express + PostgreSQL + Knex
├── frontend/         # Interface React + Vite + Tailwind
├── docker-compose.yml
└── docs/             # Documentações de negócio e arquitetura
```

## Novidades (Últimas Atualizações)
- **Backend Migrado para ESM**: Utilizamos ECMAScript Modules (`import/export`) em todo o ecossistema (inclusive em testes e migrations).
- **Tipos de Portas**: Suporte total a `Access` (Untagged), `Trunk` (Tagged) e `Hybrid` (Untagged PVID + Tagged), possibilitando o cascateamento ou a associação com APs de múltiplas sub-redes.
- **Auditoria e Multitenancy**: Acesso focado por tenant e histórico completo de modificações de portas via triggers no banco de dados.

## Início rápido

### 1. Instalar dependências

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configurar Variáveis de Ambiente e Banco de Dados

Suba o contêiner do PostgreSQL:

```bash
docker compose up -d db
```

Configure a API:

```bash
cp backend/.env_example backend/.env
# Edite backend/.env se necessário
```

### 3. Resetar e Migrar o Banco de Dados

Aplicações Knex centralizadas permitem que todo o banco de dados (schema e dados iniciais) seja configurado facilmente. Execute:

```bash
cd backend
npm run db:reset
```
Isso fará o drop do banco, rodará as *migrations* atualizadas e inserirá as *seeds* com dados iniciais (admin e switches de teste).

### 4. Rodar em desenvolvimento

Terminal 1 — API:

```bash
cd backend && npm run dev
```

Terminal 2 — Frontend:

```bash
cd frontend && npm run dev
```

| Serviço | URL |
|---------|-----|
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/docs |
| Frontend | http://localhost:5173 |

### Docker (tudo junto)

```bash
docker compose up --build
```

## Testes (backend)

Os testes são executados com o test runner nativo do Node.js:

```bash
cd backend && npm test
```
