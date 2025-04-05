
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client setup
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the request method and path
    console.log(`Request received: ${req.method} ${new URL(req.url).pathname}`);
    console.log("Running update-count function to generate organic values");
    
    // Call the database function to update the online users count
    const { data, error } = await supabase.rpc("generate_organic_value");
    
    if (error) {
      console.error("Error executing generate_organic_value:", error);
      throw error;
    }
    
    console.log("Successfully updated online users count");
    
    // Return JSON response
    return new Response(JSON.stringify({ 
      success: true,
      message: "Online users count updated successfully",
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      },
    });
  } catch (err) {
    console.error("Error in update-count function:", err);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      },
    });
  }
});
