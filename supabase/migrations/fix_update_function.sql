-- Remover a função existente
DROP FUNCTION IF EXISTS update_online_users_count();

-- Atualizar a função para retornar uma tabela
CREATE OR REPLACE FUNCTION update_online_users_count()
RETURNS TABLE (
  current_count integer,
  min_count integer,
  max_count integer,
  update_interval integer,
  updated_at timestamptz
) AS $$
DECLARE
  config RECORD;
  new_count INTEGER;
  result RECORD;
BEGIN
  -- Buscar configuração atual
  SELECT * INTO config FROM online_users LIMIT 1;
  
  IF config IS NULL THEN
    RAISE EXCEPTION 'Configuração não encontrada';
  END IF;

  -- Gerar novo valor aleatório
  SELECT random_between(config.min_count, config.max_count) INTO new_count;

  -- Atualizar o contador e retornar os valores
  UPDATE online_users
  SET 
    current_count = new_count,
    updated_at = NOW()
  WHERE id = config.id
  RETURNING 
    online_users.current_count,
    online_users.min_count,
    online_users.max_count,
    online_users.update_interval,
    online_users.updated_at
  INTO result;

  -- Atribuir os valores retornados às variáveis de saída
  current_count := result.current_count;
  min_count := result.min_count;
  max_count := result.max_count;
  update_interval := result.update_interval;
  updated_at := result.updated_at;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER; 