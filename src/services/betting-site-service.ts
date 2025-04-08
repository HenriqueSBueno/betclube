
import { supabase } from "@/integrations/supabase/client";
import { BettingSite } from "@/types";

export class BettingSiteService {
  /**
   * Get all betting sites from the database
   */
  static async getAll(): Promise<BettingSite[]> {
    try {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform Supabase data to match BettingSite type
      return (data || []).map(site => ({
        id: site.id,
        name: site.name,
        url: site.url,
        description: site.description,
        category: site.category,
        logoUrl: site.logo_url,
        registrationDate: new Date(site.registration_date),
        adminOwnerId: site.admin_owner_id,
        commission: site.commission,
        ltv: site.ltv,
        siteLabels: site.site_labels || []
      }));
    } catch (error) {
      console.error("Erro ao buscar sites de apostas:", error);
      return [];
    }
  }

  /**
   * Get a betting site by ID
   */
  static async getById(id: string): Promise<BettingSite | null> {
    try {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transform Supabase data to match BettingSite type
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        logoUrl: data.logo_url,
        registrationDate: new Date(data.registration_date),
        adminOwnerId: data.admin_owner_id,
        commission: data.commission,
        ltv: data.ltv,
        siteLabels: data.site_labels || []
      };
    } catch (error) {
      console.error("Erro ao buscar site de apostas:", error);
      return null;
    }
  }

  /**
   * Get a betting site by name
   */
  static async getByName(name: string): Promise<BettingSite | null> {
    try {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('name', name)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transform Supabase data to match BettingSite type
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        logoUrl: data.logo_url,
        registrationDate: new Date(data.registration_date),
        adminOwnerId: data.admin_owner_id,
        commission: data.commission,
        ltv: data.ltv
      };
    } catch (error) {
      console.error("Erro ao buscar site de apostas por nome:", error);
      return null;
    }
  }

  /**
   * Get betting sites by category
   */
  static async getByCategory(categoryId: string): Promise<BettingSite[]> {
    try {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .contains('category', [categoryId]);

      if (error) throw error;

      // Transform Supabase data to match BettingSite type
      return (data || []).map(site => ({
        id: site.id,
        name: site.name,
        url: site.url,
        description: site.description,
        category: site.category,
        logoUrl: site.logo_url,
        registrationDate: new Date(site.registration_date),
        adminOwnerId: site.admin_owner_id,
        commission: site.commission,
        ltv: site.ltv
      }));
    } catch (error) {
      console.error("Erro ao buscar sites de apostas por categoria:", error);
      return [];
    }
  }

  /**
   * Create a new betting site
   */
  static async create(site: Omit<BettingSite, 'id'>): Promise<BettingSite | null> {
    try {
      // Transform BettingSite type to Supabase format
      const supabaseSite = {
        name: site.name,
        url: site.url,
        description: site.description,
        category: site.category,
        logo_url: site.logoUrl,
        registration_date: site.registrationDate.toISOString(),
        admin_owner_id: site.adminOwnerId,
        commission: site.commission,
        ltv: site.ltv,
        site_labels: site.siteLabels || []
      };

      const { data, error } = await supabase
        .from('betting_sites')
        .insert(supabaseSite)
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transform Supabase data back to BettingSite type
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        logoUrl: data.logo_url,
        registrationDate: new Date(data.registration_date),
        adminOwnerId: data.admin_owner_id,
        commission: data.commission,
        ltv: data.ltv,
        siteLabels: data.site_labels || []
      };
    } catch (error) {
      console.error("Erro ao criar site de apostas:", error);
      return null;
    }
  }

  /**
   * Update an existing betting site
   */
  static async update(id: string, site: Partial<BettingSite>): Promise<BettingSite | null> {
    try {
      // Transform BettingSite type to Supabase format
      const supabaseSite: any = {};
      if (site.name) supabaseSite.name = site.name;
      if (site.url) supabaseSite.url = site.url;
      if (site.description) supabaseSite.description = site.description;
      if (site.category) supabaseSite.category = site.category;
      if (site.logoUrl) supabaseSite.logo_url = site.logoUrl;
      if (site.registrationDate) supabaseSite.registration_date = site.registrationDate.toISOString();
      if (site.adminOwnerId) supabaseSite.admin_owner_id = site.adminOwnerId;
      if (site.commission !== undefined) supabaseSite.commission = site.commission;
      if (site.ltv !== undefined) supabaseSite.ltv = site.ltv;
      if (site.siteLabels) supabaseSite.site_labels = site.siteLabels;

      const { data, error } = await supabase
        .from('betting_sites')
        .update(supabaseSite)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transform Supabase data back to BettingSite type
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        logoUrl: data.logo_url,
        registrationDate: new Date(data.registration_date),
        adminOwnerId: data.admin_owner_id,
        commission: data.commission,
        ltv: data.ltv,
        siteLabels: data.site_labels || []
      };
    } catch (error) {
      console.error("Erro ao atualizar site de apostas:", error);
      return null;
    }
  }

  /**
   * Delete a betting site by ID
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('betting_sites')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao deletar site de apostas:", error);
      return false;
    }
  }
} 
