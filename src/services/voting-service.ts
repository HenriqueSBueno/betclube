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
      console.log(`[VotingService] Iniciando reset de votos para categoria ${categoryId}`);
      
      // First get the rankings for the category
      const { data: rankings, error: rankingsError } = await supabase
        .from("daily_rankings")
        .select("id")
        .eq("category_id", categoryId);

      if (rankingsError) {
        console.error("[VotingService] Erro ao buscar rankings:", rankingsError);
        throw rankingsError;
      }
      
      if (!rankings || rankings.length === 0) {
        console.log("[VotingService] Nenhum ranking encontrado para resetar");
        return;
      }
      
      // Reset votes for each ranking
      for (const ranking of rankings) {
        console.log(`[VotingService] Resetando votos para ranking ${ranking.id}`);
        
        // 1. Reset votes in ranked_sites table
        const { error: rankedSitesError } = await supabase
          .from("ranked_sites")
          .update({ votes: 0 })
          .eq("ranking_id", ranking.id);
          
        if (rankedSitesError) {
          console.error("[VotingService] Erro ao resetar votos em ranked_sites:", rankedSitesError);
          throw rankedSitesError;
        }

        // 2. Delete all votes for this ranking from votes table
        const { error: votesError } = await supabase
          .from("votes")
          .delete()
          .eq("ranking_id", ranking.id);
          
        if (votesError) {
          console.error("[VotingService] Erro ao deletar votos:", votesError);
          throw votesError;
        }

        console.log(`[VotingService] Votos resetados com sucesso para ranking ${ranking.id}`);
      }
      
      console.log("[VotingService] Reset de votos concluído com sucesso");
    } catch (error: any) {
      console.error("[VotingService] Erro ao resetar votos:", error);
      throw error;
    }
  }

  /**
   * Register a vote for a specific site in a ranking
   */
  static async registerVote(siteId: string, rankingId: string, userId?: string): Promise<number> {
    try {
      console.log(`[VotingService] Iniciando registro de voto para site ${siteId} no ranking ${rankingId}`);
      
      // Verifica se o ranking existe e está ativo
      const { data: ranking, error: rankingError } = await supabase
        .from("daily_rankings")
        .select("id, category_id")
        .eq("id", rankingId)
        .single();

      if (rankingError) {
        console.error("[VotingService] Erro ao verificar ranking:", rankingError);
        throw new Error("Erro ao verificar ranking");
      }

      if (!ranking) {
        console.error("[VotingService] Ranking não encontrado");
        throw new Error("Ranking não encontrado");
      }

      // Verifica se o site existe no ranking
      const { data: rankedSite, error: rankedSiteError } = await supabase
        .from("ranked_sites")
        .select("id")
        .eq("ranking_id", rankingId)
        .eq("site_id", siteId)
        .single();

      if (rankedSiteError) {
        console.error("[VotingService] Erro ao verificar site no ranking:", rankedSiteError);
        throw new Error("Erro ao verificar site no ranking");
      }

      if (!rankedSite) {
        console.error("[VotingService] Site não encontrado no ranking");
        throw new Error("Site não encontrado no ranking");
      }
      
      // Primeiro, verifica se o usuário já votou neste site hoje
      if (userId) {
        const today = new Date().toISOString().split('T')[0];
        console.log(`[VotingService] Verificando voto existente para usuário ${userId} na data ${today}`);
        
        // Verifica se o usuário já votou neste site em qualquer ranking da mesma categoria hoje
        const { data: existingVote, error: checkError } = await supabase
          .from("votes")
          .select("*, daily_rankings!inner(category_id)")
          .eq("site_id", siteId)
          .eq("user_id", userId)
          .eq("daily_rankings.category_id", ranking.category_id)
          .gte("vote_date", today)
          .maybeSingle();

        if (checkError) {
          console.error("[VotingService] Erro ao verificar voto existente:", checkError);
          throw new Error("Erro ao verificar voto existente");
        }
        
        if (existingVote) {
          console.log("[VotingService] Voto já existe para este usuário hoje");
          throw new Error("Você já votou neste site hoje");
        }

        // Verifica se o usuário ainda tem votos disponíveis
        const remainingVotes = await this.getRemainingVotes(rankingId, userId);
        console.log(`[VotingService] Votos restantes para o usuário: ${remainingVotes}`);
        
        if (remainingVotes <= 0) {
          console.log("[VotingService] Usuário não tem mais votos disponíveis");
          throw new Error("Você já usou todos os seus votos para esta lista hoje");
        }
      }

      // Inicia uma transação para garantir consistência
      console.log("[VotingService] Inserindo novo voto");
      const { data: voteData, error: voteError } = await supabase
        .from("votes")
        .insert({
          site_id: siteId,
          ranking_id: rankingId,
          user_id: userId || null,
          vote_date: new Date().toISOString(),
          ip: "0.0.0.0" // Em uma aplicação real, você obteria o IP do usuário
        })
        .select()
        .single();

      if (voteError) {
        console.error("[VotingService] Erro ao inserir voto:", voteError);
        if (voteError.code === '23505') { // Código de erro para violação de chave única
          throw new Error("Você já votou neste site hoje");
        }
        throw new Error(`Erro ao registrar voto: ${voteError.message}`);
      }

      // Incrementa o contador de votos na tabela ranked_sites
      console.log("[VotingService] Incrementando contador de votos");
      const { error: updateError } = await supabase.rpc('increment_site_votes', {
        p_site_id: siteId,
        p_ranking_id: rankingId
      });

      if (updateError) {
        console.error("[VotingService] Erro ao incrementar votos:", updateError);
        throw new Error(`Erro ao atualizar contagem de votos: ${updateError.message}`);
      }

      // Busca o número atualizado de votos
      console.log("[VotingService] Buscando contagem atualizada de votos");
      const { data: updatedSite, error: fetchError } = await supabase
        .from("ranked_sites")
        .select("votes")
        .eq("site_id", siteId)
        .eq("ranking_id", rankingId)
        .single();

      if (fetchError) {
        console.error("[VotingService] Erro ao buscar votos atualizados:", fetchError);
        throw new Error(`Erro ao buscar contagem atualizada de votos: ${fetchError.message}`);
      }

      console.log(`[VotingService] Voto registrado com sucesso. Total de votos: ${updatedSite.votes}`);
      return updatedSite.votes;

    } catch (error: any) {
      console.error("[VotingService] Erro ao registrar voto:", error);
      throw error;
    }
  }
  
  /**
   * Load user votes for a ranking
   */
  static async loadUserVotes(rankingId: string, userId?: string): Promise<string[]> {
    try {
      if (!userId) return [];
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("votes")
        .select("site_id")
        .eq("ranking_id", rankingId)
        .eq("user_id", userId)
        .gte("vote_date", today);
        
      if (error) {
        console.error("Error loading user votes:", error);
        return [];
      }
      
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
      
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("ranking_id", rankingId)
        .eq("user_id", userId)
        .gte("vote_date", today);
        
      if (error) {
        console.error("Error getting remaining votes:", error);
        return 0;
      }
      
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
