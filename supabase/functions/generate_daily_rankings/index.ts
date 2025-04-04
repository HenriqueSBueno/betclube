
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const now = new Date();
    console.log(`Função de geração diária de rankings iniciada em ${now.toISOString()} (${now.toString()})`);
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all ranking configurations
    const { data: configs, error: configsError } = await supabase
      .from('ranking_configs')
      .select('*');
      
    if (configsError) {
      throw new Error(`Erro ao buscar configurações: ${configsError.message}`);
    }
    
    console.log(`Encontradas ${configs?.length || 0} configurações de ranking para processar`);
    
    if (!configs || configs.length === 0) {
      console.log('Nenhuma configuração de ranking encontrada. Tentando buscar todas as categorias.');
      
      // Se não houver configs, buscar todas as categorias e criar configs padrão
      const { data: categories, error: categoriesError } = await supabase
        .from('ranking_categories')
        .select('id, name');
        
      if (categoriesError) {
        throw new Error(`Erro ao buscar categorias: ${categoriesError.message}`);
      }
      
      console.log(`Encontradas ${categories?.length || 0} categorias para criar configs padrão`);
      
      // Criar configs padrão para cada categoria
      if (categories && categories.length > 0) {
        const defaultConfigs = categories.map(category => ({
          category_id: category.id,
          site_count: 10,
          min_votes: 0,
          max_votes: 100,
          last_modified: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('ranking_configs')
          .upsert(defaultConfigs, { onConflict: 'category_id' });
          
        if (insertError) {
          throw new Error(`Erro ao criar configs padrão: ${insertError.message}`);
        }
        
        // Buscar as configs novamente
        const { data: newConfigs, error: newConfigsError } = await supabase
          .from('ranking_configs')
          .select('*');
          
        if (newConfigsError) {
          throw new Error(`Erro ao buscar novas configurações: ${newConfigsError.message}`);
        }
        
        configs = newConfigs || [];
      }
    }
    
    const results = [];
    
    // Process each configuration
    for (const config of configs) {
      console.log(`Processando categoria ${config.category_id} com ${config.site_count} sites, min votos: ${config.min_votes}, max votos: ${config.max_votes}`);
      
      try {
        // Call the function to generate the ranking
        const { data: rankingId, error: generateError } = await supabase.rpc(
          'generate_daily_ranking',
          {
            category_id: config.category_id,
            site_count: config.site_count,
            min_votes: config.min_votes,
            max_votes: config.max_votes
          }
        );
        
        if (generateError) {
          console.error(`Erro ao gerar ranking para categoria ${config.category_id}: ${generateError.message}`);
          continue;
        }
        
        console.log(`Ranking gerado com sucesso: ${rankingId} para categoria ${config.category_id}`);
        results.push({ category_id: config.category_id, ranking_id: rankingId });
      } catch (categoryError) {
        console.error(`Exceção ao processar categoria ${config.category_id}: ${categoryError.message}`);
      }
    }
    
    console.log(`Geração de rankings diários concluída. Gerados ${results.length} rankings`);

    // Return the data
    return new Response(JSON.stringify({ 
      results, 
      message: 'Rankings diários gerados com sucesso',
      timestamp: now.toISOString(),
      categories_processed: configs?.length || 0,
      rankings_generated: results.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Erro na função de borda generate_daily_rankings: ${error.message}`);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
