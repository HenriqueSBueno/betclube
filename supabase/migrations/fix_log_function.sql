-- Ajustar permissões da tabela de log
GRANT ALL ON online_users_log TO postgres, authenticated, anon;
GRANT USAGE, SELECT ON SEQUENCE online_users_log_id_seq TO postgres, authenticated, anon;

-- Recriar a função de log com SECURITY DEFINER
CREATE OR REPLACE FUNCTION log_online_users_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE NOTICE 'Logging update: old_count=%, new_count=%, interval=%', 
                 OLD.current_count, 
                 NEW.current_count, 
                 NEW.update_interval;

    INSERT INTO online_users_log (old_count, new_count, update_interval)
    VALUES (OLD.current_count, NEW.current_count, NEW.update_interval);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS online_users_update_trigger ON online_users;

CREATE TRIGGER online_users_update_trigger
    AFTER UPDATE OF current_count ON online_users
    FOR EACH ROW
    EXECUTE FUNCTION log_online_users_update();

-- Limpar logs antigos
TRUNCATE TABLE online_users_log;

-- Função para testar o log
CREATE OR REPLACE FUNCTION test_online_users_log()
RETURNS void AS $$
DECLARE
    v_old_count integer;
    r RECORD;
BEGIN
    -- Guardar o valor atual
    SELECT current_count INTO v_old_count FROM online_users LIMIT 1;
    
    -- Fazer algumas atualizações de teste
    PERFORM update_online_users_count();
    PERFORM pg_sleep(1);
    PERFORM update_online_users_count();
    PERFORM pg_sleep(1);
    PERFORM update_online_users_count();
    
    -- Mostrar os logs
    RAISE NOTICE 'Logs após teste:';
    FOR r IN SELECT * FROM online_users_log ORDER BY created_at DESC LIMIT 5
    LOOP
        RAISE NOTICE 'Log: old=%, new=%, interval=%, time=%',
            r.old_count, r.new_count, r.update_interval, r.created_at;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 