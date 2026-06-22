# Migrações — NetMap Industrial

Toda a implantação e estruturação do banco de dados agora é feita **exclusivamente via Knex**, garantindo padronização, suporte a rollback e rastreabilidade. Não existem mais scripts SQL manuais para execução.

## Passo a Passo de Implantação

1. Clone o repositório e acesse a pasta `backend`.
2. Configure as variáveis de ambiente copiando o arquivo `.env_example` para `.env` e ajuste a string de conexão (host, senha, usuário, nome do banco, etc).
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Aplique as migrações (criar schemas, tabelas, triggers):
   ```bash
   npm run migrate:latest
   ```
5. Insira os dados iniciais (Tenants, Usuários, Roles, e dados de demonstração):
   ```bash
   npm run seed:run
   ```

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run migrate:latest` | Aplica todas as migrações pendentes |
| `npm run migrate:rollback` | Reverte o último lote de migração |
| `npm run migrate:rollback --all` | Desfaz completamente o esquema (zera o banco, sem apagar a base literal) |
| `npm run migrate:status` | Lista o status atual das migrações |
| `npm run seed:run` | Insere os dados padrão (Tenants, Root/Admin Roles, dispositivos iniciais) |
