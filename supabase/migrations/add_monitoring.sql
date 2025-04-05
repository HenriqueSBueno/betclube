-- Criar uma tabela para log de atualizações
CREATE TABLE IF NOT EXISTS online_users_log (
    id SERIAL PRIMARY KEY,
    old_count INTEGER,
    new_count INTEGER,
    update_interval INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar um trigger para registrar as mudanças
CREATE OR REPLACE FUNCTION log_online_users_update()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO online_users_log (old_count, new_count, update_interval)
    VALUES (OLD.current_count, NEW.current_count, NEW.update_interval);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS online_users_update_trigger ON online_users;

-- Adicionar o trigger
CREATE TRIGGER online_users_update_trigger
    AFTER UPDATE OF current_count ON online_users
    FOR EACH ROW
    EXECUTE FUNCTION log_online_users_update();

-- Função para verificar o histórico de atualizações
CREATE OR REPLACE FUNCTION check_update_intervals()
RETURNS TABLE (
    update_time TIMESTAMPTZ,
    count_value INTEGER,
    configured_interval_ms INTEGER,
    actual_interval_ms INTEGER,
    is_delayed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH intervals AS (
        SELECT 
            created_at,
            new_count,
            update_interval,
            EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at))) * 1000 as actual_interval
        FROM online_users_log
        ORDER BY created_at DESC
        LIMIT 10
    )
    SELECT 
        created_at as update_time,
        new_count as count_value,
        update_interval as configured_interval_ms,
        COALESCE(actual_interval::INTEGER, 0) as actual_interval_ms,
        CASE 
            WHEN actual_interval IS NULL THEN FALSE
            WHEN actual_interval > update_interval * 1.1 THEN TRUE
            ELSE FALSE
        END as is_delayed
    FROM intervals
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql; 