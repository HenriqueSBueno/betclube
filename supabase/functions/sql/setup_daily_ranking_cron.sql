
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

-- Create a new job to run the function at midnight Brasília time (3am UTC)
SELECT cron.schedule(
  'daily-rankings-generation',   -- job name
  '0 3 * * *',                  -- run at 3am UTC (midnight in Brasília) every day
  $$
  SELECT
    net.http_post(
      url:='https://emohuflyixrwuttixyas.supabase.co/functions/v1/generate_daily_rankings',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb2h1Zmx5aXhyd3V0dGl4eWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTgwMDAsImV4cCI6MjA1OTEzNDAwMH0.NTIp-v8OvSNxHHS9S6LEocrH0p-D-ameJqAJRbQXqAg"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verify the job was created correctly
SELECT * FROM cron.job WHERE jobname = 'daily-rankings-generation';

-- Add logging message to help with debugging
DO $$
BEGIN
  RAISE NOTICE 'Cron job daily-rankings-generation has been scheduled to run at 3am UTC (midnight Brasília).';
END $$;
