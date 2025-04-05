-- Habilitar a extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar schema cron se não existir
CREATE SCHEMA IF NOT EXISTS cron;

-- Garantir que o usuário authenticator tenha acesso ao schema cron
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres; 