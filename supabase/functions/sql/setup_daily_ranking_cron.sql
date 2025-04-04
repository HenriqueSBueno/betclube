
-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if any (using a different approach that won't error if job doesn't exist)
DO $$
BEGIN
  -- Try to unschedule the job if it exists
  BEGIN
    PERFORM cron.unschedule('daily-rankings-generation');
  EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist or another error occurred, just continue
    RAISE NOTICE 'Job may not exist yet, creating it now';
  END;
END $$;

-- Get current time and add 5 minutes
DO $$
DECLARE 
  current_minute INTEGER;
  current_hour INTEGER;
  target_minute INTEGER;
  target_hour INTEGER;
  cron_expression TEXT;
BEGIN
  -- Get current time components
  current_minute := EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'UTC');
  current_hour := EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC');
  
  -- Calculate target time (5 minutes from now)
  target_minute := current_minute + 5;
  target_hour := current_hour;
  
  -- Handle minute overflow
  IF target_minute >= 60 THEN
    target_minute := target_minute - 60;
    target_hour := target_hour + 1;
  END IF;
  
  -- Handle hour overflow
  IF target_hour >= 24 THEN
    target_hour := target_hour - 24;
  END IF;
  
  -- Create cron expression for 5 minutes from now
  -- Format: minute hour * * * (runs at specific minute and hour every day)
  cron_expression := target_minute || ' ' || target_hour || ' * * *';
  
  -- Create a new job to run the function at the calculated time
  PERFORM cron.schedule(
    'daily-rankings-generation',   -- job name
    cron_expression,               -- run at calculated time every day
    $$
    SELECT
      net.http_post(
        url:='https://emohuflyixrwuttixyas.supabase.co/functions/v1/generate_daily_rankings',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb2h1Zmx5aXhyd3V0dGl4eWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTgwMDAsImV4cCI6MjA1OTEzNDAwMH0.NTIp-v8OvSNxHHS9S6LEocrH0p-D-ameJqAJRbQXqAg"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
  );
  
  -- Log the scheduled time
  RAISE NOTICE 'CRON job scheduled to run at %:% UTC', target_hour, target_minute;
END $$;

-- Verify the job was created correctly
SELECT * FROM cron.job WHERE jobname = 'daily-rankings-generation';

-- Add logging message to help with debugging
DO $$
BEGIN
  RAISE NOTICE 'Cron job daily-rankings-generation has been rescheduled to run in approximately 5 minutes from now';
END $$;
