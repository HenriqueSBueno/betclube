
import { supabase } from "@/integrations/supabase/client";
import { DailyRanking, RankedSite, BettingSite, RankingCategory, RankingConfig } from "@/types";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export class RankingsService {
  // Buscar todas as configurações de ranking
  static async getAllConfigs() {
    try {
      // A tabela ranking_configs foi adicionada ao banco de dados
      const { data, error } = await supabase
        .from('ranking_configs')
        .select('*');
        
      if (error) throw error;
      return data as RankingConfig[];
    } catch (error) {
      console.error("Erro ao buscar configurações de ranking:", error);
      return [];
    }
  }
  
  // Buscar configuração de ranking específica
  static async getConfig(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('ranking_configs')
        .select('*')
        .eq('category_id', categoryId)
        .maybeSingle();
        
      if (error) throw error;
      return data as RankingConfig | null;
    } catch (error) {
      console.error("Erro ao buscar configuração de ranking:", error);
      return null;
    }
  }
  
  // Atualizar ou criar configuração de ranking
  static async upsertConfig(categoryId: string, siteCount: number, minVotes: number, maxVotes: number) {
    try {
      const { data: existingConfig } = await supabase
        .from('ranking_configs')
        .select('id')
        .eq('category_id', categoryId)
        .maybeSingle();
      
      const configData = {
        category_id: categoryId,
        site_count: siteCount,
        min_votes: minVotes,
        max_votes: maxVotes
      };
      
      let result;
      
      if (existingConfig) {
        const { data, error } = await supabase
          .from('ranking_configs')
          .update(configData)
          .eq('id', existingConfig.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('ranking_configs')
          .insert(configData)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      return result as RankingConfig;
    } catch (error) {
      console.error("Erro ao salvar configuração de ranking:", error);
      throw error;
    }
  }
  
  // Buscar rankings diários
  static async getAllRankings() {
    try {
      const { data: rankingsData, error: rankingsError } = await supabase
        .from('daily_rankings')
        .select('*');
        
      if (rankingsError) throw rankingsError;
      
      const rankings: DailyRanking[] = [];
      
      for (const ranking of rankingsData) {
        const { data: rankedSitesData, error: sitesError } = await supabase
          .from('ranked_sites')
          .select('*, site_id')
          .eq('ranking_id', ranking.id)
          .order('votes', { ascending: false });
          
        if (sitesError) throw sitesError;
        
        // Buscar detalhes de cada site
        const rankedSites: RankedSite[] = [];
        for (const rankedSite of rankedSitesData) {
          const { data: siteData, error: siteError } = await supabase
            .from('betting_sites')
            .select('*')
            .eq('id', rankedSite.site_id)
            .single();
            
          if (siteError) throw siteError;
          
          rankedSites.push({
            siteId: rankedSite.site_id,
            site: siteData as unknown as BettingSite,
            votes: rankedSite.votes
          });
        }
        
        rankings.push({
          id: ranking.id,
          categoryId: ranking.category_id,
          categoryName: ranking.category_name,
          generationDate: new Date(ranking.generation_date),
          expiration: new Date(ranking.expiration),
          sites: rankedSites
        });
      }
      
      return rankings;
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
      return [];
    }
  }
  
  // Buscar ranking por categoria
  static async getRankingByCategory(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('daily_rankings')
        .select('*')
        .eq('category_id', categoryId)
        .order('generation_date', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) return null;
      
      const { data: rankedSitesData, error: sitesError } = await supabase
        .from('ranked_sites')
        .select('*, site_id')
        .eq('ranking_id', data.id)
        .order('votes', { ascending: false });
        
      if (sitesError) throw sitesError;
      
      // Buscar detalhes de cada site
      const rankedSites: RankedSite[] = [];
      for (const rankedSite of rankedSitesData) {
        const { data: siteData, error: siteError } = await supabase
          .from('betting_sites')
          .select('*')
          .eq('id', rankedSite.site_id)
          .single();
          
        if (siteError) throw siteError;
        
        rankedSites.push({
          siteId: rankedSite.site_id,
          site: siteData as unknown as BettingSite,
          votes: rankedSite.votes
        });
      }
      
      return {
        id: data.id,
        categoryId: data.category_id,
        categoryName: data.category_name,
        generationDate: new Date(data.generation_date),
        expiration: new Date(data.expiration),
        sites: rankedSites
      } as DailyRanking;
    } catch (error) {
      console.error("Erro ao buscar ranking por categoria:", error);
      return null;
    }
  }
  
  // Regenerar ranking
  static async regenerateRanking(categoryId: string, siteCount: number, voteRange: { minVotes: number, maxVotes: number }) {
    try {
      // Primeiro, atualizamos a configuração
      await this.upsertConfig(categoryId, siteCount, voteRange.minVotes, voteRange.maxVotes);
      
      console.log("Calling generate_daily_ranking with parameters:", {
        category_id: categoryId,
        site_count: siteCount,
        min_votes: voteRange.minVotes,
        max_votes: voteRange.maxVotes
      });
      
      // Usar diretamente a função do banco de dados em vez da edge function que está falhando
      const { data, error } = await supabase.rpc('generate_daily_ranking', {
        category_id: categoryId,
        site_count: siteCount,
        min_votes: voteRange.minVotes,
        max_votes: voteRange.maxVotes
      });
      
      if (error) {
        console.error("Error from RPC call:", error);
        throw error;
      }
      
      console.log("RPC call succeeded with result:", data);
      
      // Retorna o ranking atualizado
      return this.getRankingByCategory(categoryId);
    } catch (error) {
      console.error("Erro ao regenerar ranking:", error);
      toast.error("Erro ao regenerar ranking. Tente novamente mais tarde.");
      throw error;
    }
  }
  
  // Gerar todos os rankings diários
  static async generateDailyBatch() {
    try {
      const { data: categories, error } = await supabase
        .from('ranking_categories')
        .select('id');
        
      if (error) throw error;
      
      const results = [];
      for (const category of categories) {
        // Buscar configuração para esta categoria
        const config = await this.getConfig(category.id);
        
        if (config) {
          // Se configuração existe, use seus valores
          const result = await this.regenerateRanking(
            category.id,
            config.site_count,
            { minVotes: config.min_votes, maxVotes: config.max_votes }
          );
          results.push(result);
        } else {
          // Se não, use valores padrão
          const result = await this.regenerateRanking(
            category.id,
            10, // site_count padrão
            { minVotes: 0, maxVotes: 100 } // valores padrão
          );
          results.push(result);
        }
      }
      
      return results;
    } catch (error) {
      console.error("Erro ao gerar batch de rankings diários:", error);
      toast.error("Erro ao gerar rankings. Tente novamente mais tarde.");
      throw error;
    }
  }
}
