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
- **Descoberta Automática de Gravadores NVD Intelbras**: Integração via HTTP Digest Auth com suporte total aos modelos **NVD 7132, NVD 3332, NVD 1432 e iNVD 5232**, realizando a importação automatizada de câmeras por canal com resolução de ponteiros UUID e títulos.
- **Captura de Snapshots ao Vivo**: Visualização e atualização em tempo real de fotos de câmeras IP (ex.: Intelbras VIP 1230 B G2) com suporte a requisições de até 20MB.
- **Especificações de Impressoras**: Cadastro de impressoras com informações de posse (Própria vs Locada/Outsourced), conexão (IP vs USB local), tecnologias (Laser P&B, Laser Colorida, Térmica e Jato de Tinta) e contratos.
- **Filtros Dinâmicos Multi-Critério**: Filtragem em tempo real na tela de equipamentos por Tipo, Status (Online/Offline) e NVD pai.
- **Backend Migrado para ESM**: ECMAScript Modules (`import/export`) em todo o ecossistema backend e testes automatizados (`node --test`).

## 🚀 Implantação Automatizada no Servidor (1 Comando)

Para implantar tudo automaticamente em um servidor Linux (Docker + Postgres + Migrações + Frontend + API):

```bash
./deploy.sh
```

Consulte o [Roteiro Completo de Implantação](file:///home/bruno/Documentos/netmap-industrial/ROTEIRO_IMPLANTACAO_SERVIDOR.md) para rotinas de backup, restauração e atualizações.

---

## Início rápido (Desenvolvimento)

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
| API | http://localhost:3002 |
| Swagger | http://localhost:3002/docs |
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
