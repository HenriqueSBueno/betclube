
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    let body;
    try {
      body = await req.json();
      console.log("Received request body:", body);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { url, ip } = body;
    
    if (!url) {
      console.error("Missing URL in request body");
      return new Response(
        JSON.stringify({ success: false, message: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Processing site suggestion:", { url, ip });
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceRole) {
      console.error("Supabase environment variables not set");
      return new Response(
        JSON.stringify({ success: false, message: "Server configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log("Creating Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Insert the suggestion directly into the site_suggestions table
    console.log("Inserting site suggestion into database...");
    const { data, error } = await supabase
      .from('site_suggestions')
      .insert([
        { 
          url: url,
          ip: ip || 'unknown',
          status: 'pending'
        }
      ]);

    if (error) {
      console.error("Error inserting suggestion:", error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || "Database error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Suggestion submitted successfully");
    return new Response(
      JSON.stringify({ success: true, message: "Sugestão enviada com sucesso!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unhandled error processing request:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || "An unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
