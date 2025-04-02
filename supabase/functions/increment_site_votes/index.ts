
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Tratamento da requisição OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Extrair dados do corpo da requisição
    const { rankingId, siteId } = await req.json();
    
    if (!rankingId || !siteId) {
      return new Response(JSON.stringify({ error: 'rankingId e siteId são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Configurar cliente Supabase com as credenciais do serviço
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Chamar a função RPC para incrementar votos
    const { data, error } = await supabaseClient.rpc('increment_site_votes', {
      p_ranking_id: rankingId,
      p_site_id: siteId
    });
      
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Buscar os votos atualizados
    const { data: votes, error: votesError } = await supabaseClient
      .from('ranked_sites')
      .select('votes')
      .eq('ranking_id', rankingId)
      .eq('site_id', siteId)
      .single();
    
    if (votesError) {
      return new Response(JSON.stringify({ error: votesError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ success: true, votes: votes.votes }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
