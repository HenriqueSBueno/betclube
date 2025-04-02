
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/types/auth-types";
import { toast } from "sonner";

export class VotingService {
  static VOTES_PER_RANKING = 3; // Maximum votes allowed per ranking

  // Verificar se o usuário já votou em um site específico
  static async hasVotedForSite(user: AuthUser | null, siteId: string, rankingId: string): Promise<boolean> {
    if (!user) return false;
    
    const voteKey = this.getSiteVoteKey(siteId, rankingId);
    const votes = await this.loadUserVotes(user?.id, rankingId);
    return votes[voteKey] === true;
  }

  // Obter votos restantes para o usuário no ranking
  static async getRemainingVotes(user: AuthUser | null, rankingId: string): Promise<number> {
    if (!user) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const storedVotes = localStorage.getItem(`userVotes_${user.id}_${today}`);
    const votedSiteIds = storedVotes ? JSON.parse(storedVotes) : {};
    
    // Contar votos usados para este ranking
    let usedVotes = 0;
    Object.keys(votedSiteIds).forEach(key => {
      // Extrair rankingId do formato siteId_rankingId
      const parts = key.split('_');
      if (parts.length === 2 && parts[1] === rankingId && votedSiteIds[key] === true) {
        usedVotes++;
      }
    });
    
    return Math.max(0, this.VOTES_PER_RANKING - usedVotes);
  }

  // Registrar voto do usuário
  static async registerVote(user: AuthUser, rankingId: string, siteId: string): Promise<Record<string, boolean>> {
    if (!user) throw new Error("Usuário não autenticado");
    
    // Verificar se o usuário tem votos restantes para este ranking
    const remainingVotes = await this.getRemainingVotes(user, rankingId);
    if (remainingVotes <= 0) {
      throw new Error("Você já usou todos os seus votos para esta lista hoje");
    }
    
    try {
      // Chamar a função RPC para incrementar votos no Supabase
      await supabase.rpc('increment_site_votes', {
        p_ranking_id: rankingId,
        p_site_id: siteId
      });
      
      // Salvar o voto localmente para controle de limite por usuário
      const today = new Date().toISOString().split('T')[0];
      const storedVotes = localStorage.getItem(`userVotes_${user.id}_${today}`);
      const votedSiteIds = storedVotes ? JSON.parse(storedVotes) : {};
      
      const voteKey = this.getSiteVoteKey(siteId, rankingId);
      const updatedVotes = { ...votedSiteIds, [voteKey]: true };
      localStorage.setItem(`userVotes_${user.id}_${today}`, JSON.stringify(updatedVotes));
      
      toast.success("Voto registrado com sucesso!");
      return updatedVotes;
    } catch (error: any) {
      console.error("Erro ao registrar voto:", error);
      toast.error("Erro ao registrar seu voto. Tente novamente mais tarde.");
      throw new Error(error.message || "Erro ao registrar voto");
    }
  }

  // Carregar votos do usuário
  static async loadUserVotes(userId: string | undefined, rankingId: string): Promise<Record<string, boolean>> {
    if (!userId) return {};
    
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const storedVotes = localStorage.getItem(`userVotes_${userId}_${today}`);
    
    if (storedVotes) {
      return JSON.parse(storedVotes);
    }
    
    return {};
  }

  // Obter chave para identificar voto único (site + ranking)
  static getSiteVoteKey(siteId: string, rankingId: string): string {
    return `${siteId}_${rankingId}`;
  }
}
