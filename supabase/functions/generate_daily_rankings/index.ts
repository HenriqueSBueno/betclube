
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
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Generating daily rankings at ${new Date().toISOString()}`);
    
    // Get all ranking configurations
    const { data: configs, error: configsError } = await supabase
      .from('ranking_configs')
      .select('*');
      
    if (configsError) {
      throw new Error(`Error fetching configurations: ${configsError.message}`);
    }
    
    console.log(`Found ${configs.length} ranking configurations to process`);
    
    const results = [];
    
    // Process each configuration
    for (const config of configs) {
      console.log(`Processing category ${config.category_id} with ${config.site_count} sites, min votes: ${config.min_votes}, max votes: ${config.max_votes}`);
      
      // Step 1: Get existing rankings for this category
      const { data: existingRankings, error: rankingsError } = await supabase
        .from('daily_rankings')
        .select('id')
        .eq('category_id', config.category_id);
        
      if (rankingsError) {
        console.error(`Error fetching existing rankings for category ${config.category_id}: ${rankingsError.message}`);
        continue;
      }
      
      // Step 2: Delete existing ranked sites
      if (existingRankings && existingRankings.length > 0) {
        for (const ranking of existingRankings) {
          const { error: deleteRankedSitesError } = await supabase
            .from('ranked_sites')
            .delete()
            .eq('ranking_id', ranking.id);
            
          if (deleteRankedSitesError) {
            console.error(`Error deleting ranked sites for ranking ${ranking.id}: ${deleteRankedSitesError.message}`);
            continue;
          }
        }
        
        // Step 3: Delete existing rankings
        const { error: deleteRankingsError } = await supabase
          .from('daily_rankings')
          .delete()
          .eq('category_id', config.category_id);
          
        if (deleteRankingsError) {
          console.error(`Error deleting rankings for category ${config.category_id}: ${deleteRankingsError.message}`);
          continue;
        }
      }
      
      // Step 4: Generate new ranking
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
        console.error(`Error generating ranking for category ${config.category_id}: ${generateError.message}`);
        continue;
      }
      
      console.log(`Successfully generated ranking ${rankingId} for category ${config.category_id}`);
      results.push({ category_id: config.category_id, ranking_id: rankingId });
    }
    
    console.log(`Daily ranking generation complete. Generated ${results.length} rankings`);

    // Return the data
    return new Response(JSON.stringify({ results, message: 'Daily rankings generated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Error in generate_daily_rankings edge function: ${error.message}`);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
