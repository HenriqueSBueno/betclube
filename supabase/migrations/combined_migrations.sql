-- Criar a tabela online_users se não existir
CREATE TABLE IF NOT EXISTS online_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_count integer NOT NULL DEFAULT 100,
    max_count integer NOT NULL DEFAULT 1000,
    current_count integer NOT NULL DEFAULT 100,
    update_interval integer NOT NULL DEFAULT 3000,
    updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow read access" ON online_users;
DROP POLICY IF EXISTS "Allow admin update" ON online_users;

-- Criar políticas de segurança
CREATE POLICY "Allow read access"
ON online_users FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow admin update"
ON online_users FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

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

-- Inserir registro inicial se não existir
INSERT INTO online_users (id, min_count, max_count, current_count, update_interval, updated_at)
VALUES (
  '30847864-3ca3-46d9-a9de-cb28c3fdf0d0',
  100,
  1000,
  100,
  3000,
  NOW()
)
ON CONFLICT (id) DO NOTHING; 