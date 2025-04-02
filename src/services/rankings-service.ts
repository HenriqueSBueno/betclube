
import { supabase } from "@/integrations/supabase/client";
import { DailyRanking, RankedSite, BettingSite } from "@/types";
import { Database } from "@/integrations/supabase/types";

export class RankingsService {
  // Buscar todas as configurações de ranking
  static async getAllConfigs() {
    const { data, error } = await supabase
      .from('ranking_configs')
      .select('*');
      
    if (error) throw error;
    return data;
  }
  
  // Buscar configuração de ranking específica
  static async getConfig(categoryId: string) {
    const { data, error } = await supabase
      .from('ranking_configs')
      .select('*')
      .eq('category_id', categoryId)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  }
  
  // Atualizar ou criar configuração de ranking
  static async upsertConfig(categoryId: string, siteCount: number, minVotes: number, maxVotes: number) {
    const { data: existingConfig } = await supabase
      .from('ranking_configs')
      .select('id')
      .eq('category_id', categoryId)
      .maybeSingle();
    
    const configData = {
      category_id: categoryId,
      site_count: siteCount,
      min_votes: minVotes,
      max_votes: maxVotes,
      last_modified: new Date().toISOString()
    };
    
    if (existingConfig) {
      const { data, error } = await supabase
        .from('ranking_configs')
        .update(configData)
        .eq('id', existingConfig.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('ranking_configs')
        .insert(configData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  }
  
  // Buscar rankings diários
  static async getAllRankings() {
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
  }
  
  // Buscar ranking por categoria
  static async getRankingByCategory(categoryId: string) {
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
  }
  
  // Regenerar ranking
  static async regenerateRanking(categoryId: string, siteCount: number, voteRange: { minVotes: number, maxVotes: number }) {
    // Primeiro, atualizamos a configuração
    const config = await this.upsertConfig(categoryId, siteCount, voteRange.minVotes, voteRange.maxVotes);
    
    // Chama a função do Supabase para gerar o ranking
    const { data, error } = await supabase
      .rpc('generate_daily_ranking', { category_id: categoryId });
      
    if (error) throw error;
    
    // Atualizar o campo config_id
    if (data) {
      await supabase
        .from('daily_rankings')
        .update({ config_id: config.id })
        .eq('id', data);
    }
    
    // Retorna o ranking atualizado
    return this.getRankingByCategory(categoryId);
  }
  
  // Função para simular a regeneração diária de todos os rankings
  static async generateDailyBatch() {
    const { data: categories, error } = await supabase
      .from('ranking_categories')
      .select('id');
      
    if (error) throw error;
    
    const results = [];
    for (const category of categories) {
      const result = await this.regenerateRanking(category.id, null, null);
      results.push(result);
    }
    
    return results;
  }
}
