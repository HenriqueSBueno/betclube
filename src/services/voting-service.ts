
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/types/auth-types";
import { useAuth } from "@/hooks/use-auth";

export class VotingService {
  static VOTES_PER_RANKING = 3; // Maximum votes allowed per ranking

  // Verifica se um usuário já votou em um site específico
  static async hasVotedForSite(userId: string, siteId: string, rankingId: string): Promise<boolean> {
    if (!userId) return false;
    
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('ranking_id', rankingId)
      .eq('site_id', siteId)
      .maybeSingle();
      
    if (error) {
      console.error('Erro ao verificar voto:', error);
      return false;
    }
    
    return !!data;
  }

  // Obter votos restantes para um ranking
  static async getRemainingVotes(userId: string, rankingId: string): Promise<number> {
    if (!userId) return 0;
    
    const { count, error } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('ranking_id', rankingId);
    
    if (error) {
      console.error('Erro ao contar votos:', error);
      return 0;
    }
    
    return Math.max(0, this.VOTES_PER_RANKING - (count || 0));
  }

  // Registrar voto
  static async registerVote(user: AuthUser, rankingId: string, siteId: string): Promise<void> {
    if (!user?.id) throw new Error("Usuário não autenticado");
    
    // Verificar votos restantes
    const remainingVotes = await this.getRemainingVotes(user.id, rankingId);
    if (remainingVotes <= 0) {
      throw new Error("Você já usou todos os seus votos para esta lista hoje");
    }
    
    // Verificar se já votou neste site
    const hasVoted = await this.hasVotedForSite(user.id, siteId, rankingId);
    if (hasVoted) {
      throw new Error("Você já votou neste site hoje");
    }
    
    // Em uma aplicação real, obteríamos o IP do cliente
    const mockIp = "127.0.0.1";
    
    // Inserir voto
    const { error: insertError } = await supabase
      .from('votes')
      .insert({
        user_id: user.id,
        ranking_id: rankingId,
        site_id: siteId,
        ip: mockIp
      });
      
    if (insertError) throw insertError;
    
    // Incrementar o contador de votos para o site neste ranking
    const { error: updateError } = await supabase.rpc('increment_site_votes', {
      p_ranking_id: rankingId,
      p_site_id: siteId
    });
    
    if (updateError) {
      // Tentar atualizar manualmente caso a função RPC não esteja disponível
      const { error } = await supabase
        .from('ranked_sites')
        .update({ votes: supabase.sql`votes + 1` })
        .eq('ranking_id', rankingId)
        .eq('site_id', siteId);
      
      if (error) throw error;
    }
  }

  // Carregar votos do usuário (mantido para compatibilidade com o componente existente)
  static async loadUserVotes(userId: string | undefined, rankingId: string): Promise<Record<string, boolean>> {
    if (!userId) return {};
    
    const { data, error } = await supabase
      .from('votes')
      .select('site_id, ranking_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Erro ao carregar votos:', error);
      return {};
    }
    
    const votedSiteIds: Record<string, boolean> = {};
    data.forEach(vote => {
      const voteKey = this.getSiteVoteKey(vote.site_id, vote.ranking_id);
      votedSiteIds[voteKey] = true;
    });
    
    return votedSiteIds;
  }

  // Formatação da chave para compatibilidade com o componente existente
  static getSiteVoteKey(siteId: string, rankingId: string): string {
    return `${siteId}_${rankingId}`;
  }
  
  // Função para resetar votos de um ranking específico (usado pela função de regeneração)
  static async resetVotesForRanking(rankingId: string): Promise<void> {
    // Deletar todos os votos para este ranking
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('ranking_id', rankingId);
      
    if (error) throw error;
  }
}
