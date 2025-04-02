
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' });
  }

  const { category_id, site_count = 10, min_votes = 0, max_votes = 100 } = req.body;

  try {
    if (!category_id) {
      return res.status(400).json({ message: 'Category ID is required' });
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
      return res.status(500).json({ message: 'Failed to generate ranking', error });
    }

    // Return the ranking ID
    return res.status(200).json(data);
  } catch (error) {
    console.error('Exception in generate-ranking API route:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
