-- Instalar a extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Garantir que o schema cron existe
CREATE SCHEMA IF NOT EXISTS cron;

-- Remover job existente se houver
SELECT cron.unschedule('update_online_users_count');

-- Criar job para executar a função periodicamente (a cada 3 segundos por padrão)
SELECT cron.schedule(
  'update_online_users_count',  -- nome único do job
  '*/3 * * * * *',            -- executar a cada 3 segundos (formato: segundo minuto hora dia mês dia_semana)
  'SELECT update_online_users_count()'
);

-- Criar trigger para atualizar o job quando o intervalo for alterado
CREATE OR REPLACE FUNCTION update_cron_schedule()
RETURNS TRIGGER AS $$
BEGIN
  -- Converter o intervalo de milissegundos para segundos e criar o padrão cron
  -- Garantir que o intervalo seja pelo menos 1 segundo
  PERFORM cron.schedule(
    'update_online_users_count',
    '*/' || GREATEST(1, NEW.update_interval / 1000)::text || ' * * * * *',
    'SELECT update_online_users_count()'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_cron_on_interval_change ON online_users;

-- Criar trigger que atualiza o job quando o intervalo é alterado
CREATE TRIGGER update_cron_on_interval_change
  AFTER UPDATE OF update_interval ON online_users
  FOR EACH ROW
  EXECUTE FUNCTION update_cron_schedule(); 