
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
    console.log(`Daily rankings generation function started at ${now.toISOString()} (${now.toString()})`);
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all ranking configurations
    const { data: configs, error: configsError } = await supabase
      .from('ranking_configs')
      .select('*');
      
    if (configsError) {
      throw new Error(`Error fetching configurations: ${configsError.message}`);
    }
    
    console.log(`Found ${configs?.length || 0} ranking configurations to process`);
    
    if (!configs || configs.length === 0) {
      console.log('No ranking configurations found. Attempting to fetch all categories.');
      
      // If no configs exist, fetch all categories and create default configs
      const { data: categories, error: categoriesError } = await supabase
        .from('ranking_categories')
        .select('id, name');
        
      if (categoriesError) {
        throw new Error(`Error fetching categories: ${categoriesError.message}`);
      }
      
      console.log(`Found ${categories?.length || 0} categories to create default configs`);
      
      // Create default configs for each category
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
          throw new Error(`Error creating default configs: ${insertError.message}`);
        }
        
        // Fetch the configs again
        const { data: newConfigs, error: newConfigsError } = await supabase
          .from('ranking_configs')
          .select('*');
          
        if (newConfigsError) {
          throw new Error(`Error fetching new configurations: ${newConfigsError.message}`);
        }
        
        configs = newConfigs || [];
      }
    }
    
    const results = [];
    
    // Process each configuration
    for (const config of configs) {
      console.log(`Processing category ${config.category_id} with ${config.site_count} sites, min votes: ${config.min_votes}, max votes: ${config.max_votes}`);
      
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
          console.error(`Error generating ranking for category ${config.category_id}: ${generateError.message}`);
          continue;
        }
        
        console.log(`Ranking generated successfully: ${rankingId} for category ${config.category_id}`);
        results.push({ category_id: config.category_id, ranking_id: rankingId });
      } catch (categoryError) {
        console.error(`Exception processing category ${config.category_id}: ${categoryError.message}`);
      }
    }
    
    console.log(`Daily rankings generation completed. Generated ${results.length} rankings`);

    // Return the data
    return new Response(JSON.stringify({ 
      results, 
      message: 'Daily rankings generated successfully',
      timestamp: now.toISOString(),
      categories_processed: configs?.length || 0,
      rankings_generated: results.length
    }), {
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
