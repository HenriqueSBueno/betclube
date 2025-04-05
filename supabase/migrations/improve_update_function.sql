-- Função para verificar se deve atualizar baseado no intervalo
CREATE OR REPLACE FUNCTION should_update_online_users()
RETURNS boolean AS $$
DECLARE
    last_update timestamptz;
    config_interval integer;
BEGIN
    -- Buscar última atualização e intervalo configurado
    SELECT updated_at, update_interval 
    INTO last_update, config_interval
    FROM online_users 
    LIMIT 1;
    
    -- Se não houver última atualização ou se o intervalo já passou
    RETURN last_update IS NULL OR 
           EXTRACT(EPOCH FROM (clock_timestamp() - last_update)) * 1000 >= config_interval;
END;
$$ LANGUAGE plpgsql;

-- Melhorar a função de atualização para incluir verificação de intervalo
CREATE OR REPLACE FUNCTION update_online_users_count()
RETURNS TABLE (
    current_count integer,
    min_count integer,
    max_count integer,
    update_interval integer,
    updated_at timestamptz,
    was_updated boolean
) AS $$
DECLARE
    config RECORD;
    new_count INTEGER;
    result RECORD;
BEGIN
    -- Verificar se deve atualizar
    IF NOT should_update_online_users() THEN
        -- Retornar valores atuais sem atualizar
        SELECT o.* INTO config 
        FROM online_users o 
        LIMIT 1;
        
        RETURN QUERY SELECT 
            config.current_count,
            config.min_count,
            config.max_count,
            config.update_interval,
            config.updated_at,
            false;
        RETURN;
    END IF;

    -- Buscar configuração atual
    SELECT * INTO config FROM online_users LIMIT 1;
    
    IF config IS NULL THEN
        RAISE EXCEPTION 'Configuração não encontrada';
    END IF;

    -- Gerar novo valor aleatório
    SELECT random_between(config.min_count, config.max_count) INTO new_count;

    -- Atualizar apenas se o novo valor for diferente
    IF new_count != config.current_count THEN
        UPDATE online_users ou
        SET 
            current_count = new_count,
            updated_at = clock_timestamp()
        WHERE ou.id = config.id
        RETURNING 
            ou.current_count,
            ou.min_count,
            ou.max_count,
            ou.update_interval,
            ou.updated_at,
            true as was_updated
        INTO result;
        
        -- Atribuir valores do resultado
        current_count := result.current_count;
        min_count := result.min_count;
        max_count := result.max_count;
        update_interval := result.update_interval;
        updated_at := result.updated_at;
        was_updated := result.was_updated;
    ELSE
        -- Retornar valores atuais sem atualizar
        current_count := config.current_count;
        min_count := config.min_count;
        max_count := config.max_count;
        update_interval := config.update_interval;
        updated_at := config.updated_at;
        was_updated := false;
    END IF;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar o trigger para registrar apenas atualizações reais
CREATE OR REPLACE FUNCTION log_online_users_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Registrar apenas se o valor realmente mudou
    IF OLD.current_count != NEW.current_count THEN
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 