
// This is a simple API endpoint for generating rankings
import { supabase } from "@/integrations/supabase/client";

// Define types for request and response
export interface GenerateRankingRequest {
  category_id: string;
  site_count?: number;
  min_votes?: number;
  max_votes?: number;
}

export interface GenerateRankingResponse {
  ranking_id?: string;
  message?: string;
  error?: any;
}

// API route handler function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' });
  }

  try {
    const { category_id, site_count = 10, min_votes = 0, max_votes = 100 } = req.body;

    if (!category_id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    console.log(`API: Generating ranking for category ${category_id} with ${site_count} sites, min votes: ${min_votes}, max votes: ${max_votes}`);

    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke('generate_daily_ranking', {
      body: {
        category_id,
        site_count,
        min_votes,
        max_votes
      }
    });

    if (error) {
      console.error('Error invoking edge function:', error);
      return res.status(500).json({ message: 'Failed to generate ranking', error: error.message });
    }

    console.log('Edge function response:', data);
    
    // Return the ranking ID with a proper JSON response
    return res.status(200).json(data);
  } catch (error) {
    console.error('Exception in generate-ranking API route:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Also export the function for direct usage from other parts of the application
export async function generateRanking(requestBody: GenerateRankingRequest): Promise<GenerateRankingResponse> {
  try {
    const { category_id, site_count = 10, min_votes = 0, max_votes = 100 } = requestBody;

    if (!category_id) {
      return { message: 'Category ID is required' };
    }

    // Use the Supabase edge function
    const { data, error } = await supabase.functions.invoke('generate_daily_ranking', {
      body: {
        category_id,
        site_count,
        min_votes,
        max_votes
      }
    });

    if (error) {
      console.error('Error invoking edge function:', error);
      return { message: 'Failed to generate ranking', error: error.message };
    }

    // Return the ranking ID
    return data;
  } catch (error) {
    console.error('Exception in generate-ranking function:', error);
    return { 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
