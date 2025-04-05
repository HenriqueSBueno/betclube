-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow read access" ON online_users;
DROP POLICY IF EXISTS "Allow admin update" ON online_users;

-- Criar políticas de segurança
CREATE POLICY "Allow read access"
ON online_users FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow admin insert"
ON online_users FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Allow admin update"
ON online_users FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

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