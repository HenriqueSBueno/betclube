
import { supabase } from "@/integrations/supabase/client";

export class VotingService {
  /**
   * Increment the vote count for a betting site
   */
  static async incrementVote(siteId: string, categoryId: string): Promise<void> {
    try {
      // Call the Supabase Edge Function for incrementing votes
      const { error } = await supabase.functions.invoke("increment_site_votes", {
        body: { site_id: siteId, category_id: categoryId },
      });

      if (error) {
        throw new Error(`Error incrementing vote: ${error.message}`);
      }
    } catch (error: any) {
      console.error("Error incrementing vote:", error);
      throw error;
    }
  }

  /**
   * Get the vote count for a specific site in a category
   */
  static async getVoteCount(siteId: string, categoryId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("voting_records")
        .select("vote_count")
        .eq("betting_site_id", siteId)
        .eq("category_id", categoryId)
        .single();

      if (error) {
        throw error;
      }

      return data?.vote_count || 0;
    } catch (error) {
      console.error("Error getting vote count:", error);
      return 0;
    }
  }
  
  /**
   * Reset all votes for a specific ranking category
   */
  static async resetVotesForRanking(categoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("voting_records")
        .update({ vote_count: 0 })
        .eq("category_id", categoryId);

      if (error) {
        throw new Error(`Error resetting votes: ${error.message}`);
      }
    } catch (error: any) {
      console.error("Error resetting votes:", error);
      throw error;
    }
  }
}
