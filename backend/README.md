# NetMap Industrial — Backend

API REST em Node.js + Express + PostgreSQL.

## Desenvolvimento

```bash
cp .env_example .env
npm install
npm run dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | API com nodemon |
| `npm start` | Produção |
| `npm test` | Testes unitários e integração |
| `npm run migrate:latest` | Migrações Knex |
| `npm run seed:run` | Dados de demonstração |

## Banco

Ver `MIGRATIONS.md` e scripts em `db/bd.sql`.

## Endpoints

Prefixo: `/api`

- `GET /dashboard` — estatísticas
- `GET /switches`, `GET /switches/:id?ports=true`
- `GET /ports/:id`, `PUT /ports/:id`
- `GET /devices`, `POST /devices`
- `GET /vlans`
- `POST /scan/network` — stub SNMP

Documentação interativa: http://localhost:3001/docs
