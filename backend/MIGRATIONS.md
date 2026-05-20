# Migrações — NetMap Industrial

## Opção A — Script SQL direto (PostgreSQL)

```bash
# 1. Criar o banco (opcional)
psql -U postgres -f backend/db/create_database.sql

# 2. Schema + dados de demonstração
psql -U postgres -d netmap -f backend/db/bd.sql
```

Arquivos:

| Arquivo | Conteúdo |
|---------|----------|
| `db/create_database.sql` | Cria o banco `netmap` |
| `db/bd.sql` | Tabelas, índices, triggers, views e seed |

## Opção B — Knex (recomendado em desenvolvimento)

```bash
cd backend
cp .env_example .env
npm install
npm run migrate:latest
npm run seed:run
```

| Comando | Descrição |
|---------|-----------|
| `npm run migrate:latest` | Aplica migrações |
| `npm run migrate:rollback` | Reverte último lote |
| `npm run migrate:status` | Lista status |
| `npm run seed:run` | Dados de demonstração |
