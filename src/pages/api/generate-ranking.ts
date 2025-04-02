
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

    // Step 1: Update or create configuration in ranking_configs
    const configResult = await supabase.from('ranking_configs').upsert({
      category_id,
      site_count,
      min_votes,
      max_votes,
      last_modified: new Date().toISOString(),
    }, {
      onConflict: 'category_id'
    });

    if (configResult.error) {
      console.error('Error updating ranking configuration:', configResult.error);
      return res.status(500).json({ 
        message: 'Failed to update ranking configuration',
        error: configResult.error.message 
      });
    }

    // Step 2: Get existing ranking to delete
    const { data: existingRankings } = await supabase
      .from('daily_rankings')
      .select('id')
      .eq('category_id', category_id);

    // Step 3: Delete related ranked_sites for existing rankings
    if (existingRankings && existingRankings.length > 0) {
      for (const ranking of existingRankings) {
        // Delete ranked sites entries first (due to foreign key constraints)
        const { error: deleteRankedSitesError } = await supabase
          .from('ranked_sites')
          .delete()
          .eq('ranking_id', ranking.id);

        if (deleteRankedSitesError) {
          console.error('Error deleting existing ranked sites:', deleteRankedSitesError);
          return res.status(500).json({ 
            message: 'Failed to delete existing ranked sites', 
            error: deleteRankedSitesError.message 
          });
        }
      }

      // Step 4: Delete existing rankings
      const { error: deleteRankingsError } = await supabase
        .from('daily_rankings')
        .delete()
        .eq('category_id', category_id);

      if (deleteRankingsError) {
        console.error('Error deleting existing rankings:', deleteRankingsError);
        return res.status(500).json({ 
          message: 'Failed to delete existing rankings', 
          error: deleteRankingsError.message 
        });
      }
    }

    // Step 5: Generate new ranking using database function
    const { data, error } = await supabase.rpc('generate_daily_ranking', {
      category_id,
      site_count,
      min_votes,
      max_votes
    });

    if (error) {
      console.error('Error calling database function:', error);
      return res.status(500).json({ message: 'Failed to generate ranking', error: error.message });
    }

    console.log('Database function response:', data);
    
    // Return the ranking ID with a proper JSON response
    return res.status(200).json({ ranking_id: data });
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

    // Step 1: Update or create configuration in ranking_configs
    const configResult = await supabase.from('ranking_configs').upsert({
      category_id,
      site_count,
      min_votes,
      max_votes,
      last_modified: new Date().toISOString(),
    }, {
      onConflict: 'category_id'
    });

    if (configResult.error) {
      console.error('Error updating ranking configuration:', configResult.error);
      return { 
        message: 'Failed to update ranking configuration',
        error: configResult.error.message 
      };
    }

    // Step 2: Get existing ranking to delete
    const { data: existingRankings } = await supabase
      .from('daily_rankings')
      .select('id')
      .eq('category_id', category_id);

    // Step 3: Delete related ranked_sites for existing rankings
    if (existingRankings && existingRankings.length > 0) {
      for (const ranking of existingRankings) {
        // Delete ranked sites entries first (due to foreign key constraints)
        const { error: deleteRankedSitesError } = await supabase
          .from('ranked_sites')
          .delete()
          .eq('ranking_id', ranking.id);

        if (deleteRankedSitesError) {
          console.error('Error deleting existing ranked sites:', deleteRankedSitesError);
          return { 
            message: 'Failed to delete existing ranked sites', 
            error: deleteRankedSitesError.message 
          };
        }
      }

      // Step 4: Delete existing rankings
      const { error: deleteRankingsError } = await supabase
        .from('daily_rankings')
        .delete()
        .eq('category_id', category_id);

      if (deleteRankingsError) {
        console.error('Error deleting existing rankings:', deleteRankingsError);
        return { 
          message: 'Failed to delete existing rankings', 
          error: deleteRankingsError.message 
        };
      }
    }

    // Step 5: Generate new ranking using database function
    const { data, error } = await supabase.rpc('generate_daily_ranking', {
      category_id,
      site_count,
      min_votes,
      max_votes
    });

    if (error) {
      console.error('Error calling database function:', error);
      return { message: 'Failed to generate ranking', error: error.message };
    }

    // Return the ranking ID
    return { ranking_id: data };
  } catch (error) {
    console.error('Exception in generate-ranking function:', error);
    return { 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
