
-- Habilitar as extensões necessárias (se ainda não estiverem habilitadas)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remover o job existente se houver
SELECT cron.unschedule('daily-rankings-generation');

-- Criar um novo job para executar a função às 0h no horário de Brasília (3h UTC)
SELECT cron.schedule(
  'daily-rankings-generation',   -- nome do job
  '0 3 * * *',                  -- executar às 3h UTC (0h de Brasília) todos os dias
  $$
  SELECT
    net.http_post(
      url:='https://emohuflyixrwuttixyas.supabase.co/functions/v1/generate_daily_rankings',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb2h1Zmx5aXhyd3V0dGl4eWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTgwMDAsImV4cCI6MjA1OTEzNDAwMH0.NTIp-v8OvSNxHHS9S6LEocrH0p-D-ameJqAJRbQXqAg"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verificar se o job foi criado corretamente
SELECT * FROM cron.job WHERE jobname = 'daily-rankings-generation';
