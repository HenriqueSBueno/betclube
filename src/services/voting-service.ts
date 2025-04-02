
import { supabase } from "@/integrations/supabase/client";

export class VotingService {
  /**
   * Increment the vote count for a betting site
   */
  static async incrementVote(siteId: string, rankingId: string): Promise<void> {
    try {
      // Call the Supabase Edge Function for incrementing votes
      const { error } = await supabase.functions.invoke("increment_site_votes", {
        body: { p_site_id: siteId, p_ranking_id: rankingId },
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
   * Get the vote count for a specific site in a ranking
   */
  static async getVoteCount(siteId: string, rankingId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("ranked_sites")
        .select("votes")
        .eq("site_id", siteId)
        .eq("ranking_id", rankingId)
        .single();

      if (error) {
        throw error;
      }

      return data?.votes || 0;
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
      // First get the rankings for the category
      const { data: rankings, error: rankingsError } = await supabase
        .from("daily_rankings")
        .select("id")
        .eq("category_id", categoryId);

      if (rankingsError) throw rankingsError;
      
      if (!rankings || rankings.length === 0) return;
      
      // Reset votes for each ranking
      for (const ranking of rankings) {
        const { error } = await supabase
          .from("ranked_sites")
          .update({ votes: 0 })
          .eq("ranking_id", ranking.id);
          
        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Error resetting votes:", error);
      throw error;
    }
  }

  /**
   * Register a vote for a specific site in a ranking
   */
  static async registerVote(siteId: string, rankingId: string, userId?: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke("register_vote", {
        body: { 
          p_site_id: siteId, 
          p_ranking_id: rankingId,
          p_user_id: userId || null,
          p_ip: "0.0.0.0" // In a real app, you would get the user's IP
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Error registering vote:", error);
      throw error;
    }
  }
  
  /**
   * Load user votes for a ranking
   */
  static async loadUserVotes(rankingId: string, userId?: string): Promise<string[]> {
    try {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("votes")
        .select("site_id")
        .eq("ranking_id", rankingId)
        .eq("user_id", userId);
        
      if (error) throw error;
      
      return data.map(vote => vote.site_id);
    } catch (error) {
      console.error("Error loading user votes:", error);
      return [];
    }
  }
  
  /**
   * Get remaining votes for a user in a ranking
   */
  static async getRemainingVotes(rankingId: string, userId?: string): Promise<number> {
    try {
      // Default max votes per ranking
      const MAX_VOTES = 3;
      
      if (!userId) return MAX_VOTES;
      
      const { count, error } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("ranking_id", rankingId)
        .eq("user_id", userId);
        
      if (error) throw error;
      
      return Math.max(0, MAX_VOTES - (count || 0));
    } catch (error) {
      console.error("Error getting remaining votes:", error);
      return 0;
    }
  }
  
  /**
   * Get a unique key for a site vote
   */
  static getSiteVoteKey(siteId: string, rankingId: string): string {
    return `vote-${siteId}-${rankingId}`;
  }
}
