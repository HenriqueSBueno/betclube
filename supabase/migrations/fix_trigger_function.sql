-- Recriar a tabela de log com timestamp mais preciso
DROP TABLE IF EXISTS online_users_log;
CREATE TABLE online_users_log (
    id SERIAL PRIMARY KEY,
    old_count INTEGER,
    new_count INTEGER,
    update_interval INTEGER,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- Recriar a função do trigger
CREATE OR REPLACE FUNCTION log_online_users_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir log com timestamp preciso
    INSERT INTO online_users_log (
        old_count,
        new_count,
        update_interval,
        created_at
    ) VALUES (
        OLD.current_count,
        NEW.current_count,
        NEW.update_interval,
        clock_timestamp()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS online_users_update_trigger ON online_users;
CREATE TRIGGER online_users_update_trigger
    AFTER UPDATE OF current_count ON online_users
    FOR EACH ROW
    EXECUTE FUNCTION log_online_users_update();

-- Remover função existente
DROP FUNCTION IF EXISTS check_update_intervals();

-- Função para verificar os últimos logs com intervalos
CREATE OR REPLACE FUNCTION check_update_intervals()
RETURNS TABLE (
    log_time TIMESTAMPTZ,
    old_value INTEGER,
    new_value INTEGER,
    configured_interval_ms INTEGER,
    actual_interval_ms NUMERIC,
    is_delayed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH intervals AS (
        SELECT 
            created_at,
            old_count,
            new_count,
            update_interval,
            EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at))) * 1000 as interval_ms
        FROM online_users_log
        ORDER BY created_at DESC
        LIMIT 10
    )
    SELECT 
        created_at as log_time,
        old_count as old_value,
        new_count as new_value,
        update_interval as configured_interval_ms,
        COALESCE(interval_ms, 0) as actual_interval_ms,
        CASE 
            WHEN interval_ms IS NULL THEN FALSE
            WHEN interval_ms > update_interval * 1.1 THEN TRUE
            ELSE FALSE
        END as is_delayed
    FROM intervals
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql; 