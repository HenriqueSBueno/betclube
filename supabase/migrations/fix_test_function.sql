-- Limpar logs antigos
TRUNCATE TABLE online_users_log;

-- Recriar a função de teste com intervalos mais precisos
CREATE OR REPLACE FUNCTION test_online_users_log()
RETURNS TABLE (
    update_number INTEGER,
    old_value INTEGER,
    new_value INTEGER,
    interval_ms INTEGER,
    time_of_update TIMESTAMPTZ,
    elapsed_ms NUMERIC
) AS $$
DECLARE
    start_time TIMESTAMPTZ;
    last_update TIMESTAMPTZ;
BEGIN
    -- Registrar tempo inicial
    start_time := clock_timestamp();
    last_update := start_time;

    -- Primeira atualização
    PERFORM update_online_users_count();
    SELECT current_count, clock_timestamp() 
    INTO new_value, time_of_update 
    FROM online_users LIMIT 1;
    
    update_number := 1;
    old_value := NULL;
    interval_ms := NULL;
    elapsed_ms := EXTRACT(EPOCH FROM (time_of_update - start_time)) * 1000;
    RETURN NEXT;
    
    -- Esperar 2 segundos
    PERFORM pg_sleep(2);
    last_update := time_of_update;
    
    -- Segunda atualização
    PERFORM update_online_users_count();
    old_value := new_value;
    SELECT current_count, clock_timestamp() 
    INTO new_value, time_of_update 
    FROM online_users LIMIT 1;
    
    update_number := 2;
    interval_ms := EXTRACT(EPOCH FROM (time_of_update - last_update)) * 1000;
    elapsed_ms := EXTRACT(EPOCH FROM (time_of_update - start_time)) * 1000;
    RETURN NEXT;
    
    -- Esperar 3 segundos
    PERFORM pg_sleep(3);
    last_update := time_of_update;
    
    -- Terceira atualização
    PERFORM update_online_users_count();
    old_value := new_value;
    SELECT current_count, clock_timestamp() 
    INTO new_value, time_of_update 
    FROM online_users LIMIT 1;
    
    update_number := 3;
    interval_ms := EXTRACT(EPOCH FROM (time_of_update - last_update)) * 1000;
    elapsed_ms := EXTRACT(EPOCH FROM (time_of_update - start_time)) * 1000;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql; 