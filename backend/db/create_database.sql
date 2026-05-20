-- Cria o banco netmap (execute conectado ao banco postgres)
-- psql -U postgres -f db/create_database.sql

SELECT format(
  'CREATE DATABASE %I WITH ENCODING ''UTF8''',
  'netmap'
)
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = 'netmap'
)\gexec

\echo 'Banco netmap pronto. Execute: psql -U postgres -d netmap -f db/bd.sql'
