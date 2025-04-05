-- Alterar o tipo da coluna id para uuid
ALTER TABLE online_users
ALTER COLUMN id TYPE uuid USING id::uuid;

-- Atualizar a sequência para usar uuid_generate_v4() como padrão
ALTER TABLE online_users
ALTER COLUMN id SET DEFAULT uuid_generate_v4(); 