
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
    
    // Get request payload
    const { category_id, site_count = 10, min_votes = 0, max_votes = 100 } = await req.json();
    
    console.log(`Edge function called with category_id=${category_id}, site_count=${site_count}, min_votes=${min_votes}, max_votes=${max_votes}`);

    if (!category_id) {
      throw new Error('Category ID is required');
    }

    // Call the PostgreSQL function to generate the daily ranking
    const { data, error } = await supabase.rpc('generate_daily_ranking', {
      category_id,
      site_count,
      min_votes,
      max_votes
    });

    if (error) throw error;

    console.log(`Successfully generated ranking with ID: ${data}`);

    // Return the data
    return new Response(JSON.stringify({ ranking_id: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Error in generate_daily_ranking edge function: ${error.message}`);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
