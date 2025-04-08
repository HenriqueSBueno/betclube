import { supabase } from '@/integrations/supabase/client';

export class VotingService {
  static async registerVote(siteId: string, rankingId: string, userId: string): Promise<number> {
    try {
      // Verifica se o usuário já votou neste site
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('site_id', siteId)
        .eq('ranking_id', rankingId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Erro ao verificar voto existente');
      }

      if (existingVote) {
        throw new Error('Você já votou neste site');
      }

      // Registra o novo voto
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          site_id: siteId,
          ranking_id: rankingId,
          user_id: userId,
          ip: '0.0.0.0' // IP será atualizado pelo trigger no banco
        });

      if (voteError) {
        throw new Error('Erro ao registrar voto');
      }

      // Atualiza a contagem de votos do site
      const { data: updatedSite, error: updateError } = await supabase
        .from('betting_sites')
        .update({ votes_count: supabase.sql`votes_count + 1` })
        .eq('id', siteId)
        .select('votes_count')
        .single();

      if (updateError) {
        throw new Error('Erro ao atualizar contagem de votos');
      }

      return updatedSite.votes_count;
    } catch (error: any) {
      console.error('Erro ao registrar voto:', error);
      throw error;
    }
  }

  static async getVoteCount(siteId: string, rankingId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('site_id', siteId)
        .eq('ranking_id', rankingId);

      if (error) {
        throw new Error('Erro ao buscar contagem de votos');
      }

      return data?.length || 0;
    } catch (error: any) {
      console.error('Erro ao buscar contagem de votos:', error);
      throw error;
    }
  }

  static async hasUserVoted(siteId: string, rankingId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('site_id', siteId)
        .eq('ranking_id', rankingId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error('Erro ao verificar voto do usuário');
      }

      return !!data;
    } catch (error: any) {
      console.error('Erro ao verificar voto do usuário:', error);
      throw error;
    }
  }
} 