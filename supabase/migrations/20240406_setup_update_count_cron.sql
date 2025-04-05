
-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if any
DO $$
BEGIN
  -- Try to unschedule the job if it exists
  BEGIN
    PERFORM cron.unschedule('update-count-function');
  EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist or another error occurred, just continue
    RAISE NOTICE 'Job may not exist yet, creating it now';
  END;
END $$;

-- Schedule the job to run every 3 seconds
SELECT cron.schedule(
  'update-count-function',   -- job name
  '*/3 * * * * *',           -- run every 3 seconds (second minute hour day month weekday)
  $$
  SELECT
    net.http_post(
      url:='https://emohuflyixrwuttixyas.supabase.co/functions/v1/update-count',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb2h1Zmx5aXhyd3V0dGl4eWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTgwMDAsImV4cCI6MjA1OTEzNDAwMH0.NTIp-v8OvSNxHHS9S6LEocrH0p-D-ameJqAJRbQXqAg"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verify the job was created
SELECT * FROM cron.job WHERE jobname = 'update-count-function';

-- Add logging message
DO $$
BEGIN
  RAISE NOTICE 'Cron job setup complete: update-count-function will run every 3 seconds';
END $$;
