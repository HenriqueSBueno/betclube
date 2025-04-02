
// This is a simple API endpoint for generating rankings
// We're not using Next.js so we need to adapt this file
import { supabase } from "@/integrations/supabase/client";

// Define types for request and response
interface RequestBody {
  category_id: string;
  site_count?: number;
  min_votes?: number;
  max_votes?: number;
}

interface ResponseData {
  message?: string;
  error?: any;
  data?: any;
}

// Create a function that would normally be a Next.js API handler
export async function generateRanking(requestBody: RequestBody): Promise<ResponseData> {
  try {
    if (!requestBody.category_id) {
      return { message: 'Category ID is required' };
    }

    const { category_id, site_count = 10, min_votes = 0, max_votes = 100 } = requestBody;

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
      return { message: 'Failed to generate ranking', error };
    }

    // Return the ranking ID
    return { data };
  } catch (error) {
    console.error('Exception in generate-ranking API route:', error);
    return { message: 'Internal server error', error: (error as Error).message };
  }
}

// Export default for consistency, even though we're not using Next.js
export default generateRanking;
