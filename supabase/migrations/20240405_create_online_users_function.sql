-- Função para gerar um número aleatório entre min e max
CREATE OR REPLACE FUNCTION random_between(min_val integer, max_val integer)
RETURNS integer AS $$
BEGIN
  RETURN floor(random() * (max_val - min_val + 1) + min_val);
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar o contador de usuários online
CREATE OR REPLACE FUNCTION update_online_users_count()
RETURNS json AS $$
DECLARE
  config RECORD;
  new_count INTEGER;
BEGIN
  -- Buscar configuração atual
  SELECT * INTO config FROM online_users LIMIT 1;
  
  IF config IS NULL THEN
    RAISE EXCEPTION 'Configuração não encontrada';
  END IF;

  -- Gerar novo valor aleatório
  SELECT random_between(config.min_count, config.max_count) INTO new_count;

  -- Atualizar o contador
  UPDATE online_users
  SET 
    current_count = new_count,
    updated_at = NOW()
  WHERE id = config.id
  RETURNING *;

  -- Retornar configuração atualizada
  RETURN json_build_object(
    'current_count', new_count,
    'min_count', config.min_count,
    'max_count', config.max_count,
    'update_interval', config.update_interval
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

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