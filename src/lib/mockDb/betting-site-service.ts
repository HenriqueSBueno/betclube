
import { bettingSites } from './models';
import { BettingSite } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const bettingSiteService = {
  getAll: async (): Promise<BettingSite[]> => {
    try {
      // Get sites from Supabase
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*');
      
      if (error) {
        console.error('Error fetching betting sites:', error);
        return [...bettingSites]; // Fallback to mock data
      }
      
      // Map Supabase data to BettingSite type
      return data.map(site => ({
        id: site.id,
        name: site.name,
        url: site.url,
        description: site.description,
        category: site.category,
        logoUrl: site.logo_url || undefined,
        registrationDate: new Date(site.registration_date),
        adminOwnerId: site.admin_owner_id,
        commission: site.commission || undefined,
        ltv: site.ltv || undefined
      }));
    } catch (error) {
      console.error('Error in getAll:', error);
      return [...bettingSites]; // Fallback to mock data
    }
  },
  
  findById: async (id: string): Promise<BettingSite | undefined> => {
    try {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error || !data) {
        console.error('Error finding betting site by ID:', error);
        return bettingSites.find(site => site.id === id); // Fallback to mock data
      }
      
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        logoUrl: data.logo_url || undefined,
        registrationDate: new Date(data.registration_date),
        adminOwnerId: data.admin_owner_id,
        commission: data.commission || undefined,
        ltv: data.ltv || undefined
      };
    } catch (error) {
      console.error('Error in findById:', error);
      return bettingSites.find(site => site.id === id); // Fallback to mock data
    }
  },
  
  findByCategory: async (category: string): Promise<BettingSite[]> => {
    try {
      // Unfortunately we can't directly query arrays with "contains" in Supabase
      // So we need to get all sites and filter them
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*');
      
      if (error) {
        console.error('Error finding betting sites by category:', error);
        return bettingSites.filter(site => site.category.includes(category)); // Fallback to mock data
      }
      
      return data
        .filter(site => site.category.includes(category))
        .map(site => ({
          id: site.id,
          name: site.name,
          url: site.url,
          description: site.description,
          category: site.category,
          logoUrl: site.logo_url || undefined,
          registrationDate: new Date(site.registration_date),
          adminOwnerId: site.admin_owner_id,
          commission: site.commission || undefined,
          ltv: site.ltv || undefined
        }));
    } catch (error) {
      console.error('Error in findByCategory:', error);
      return bettingSites.filter(site => site.category.includes(category)); // Fallback to mock data
    }
  },
  
  findByName: async (name: string): Promise<BettingSite | undefined> => {
    try {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .ilike('name', name)
        .maybeSingle();
      
      if (error || !data) {
        console.error('Error finding betting site by name:', error);
        return bettingSites.find(site => site.name.toLowerCase() === name.toLowerCase()); // Fallback to mock data
      }
      
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        logoUrl: data.logo_url || undefined,
        registrationDate: new Date(data.registration_date),
        adminOwnerId: data.admin_owner_id,
        commission: data.commission || undefined,
        ltv: data.ltv || undefined
      };
    } catch (error) {
      console.error('Error in findByName:', error);
      return bettingSites.find(site => site.name.toLowerCase() === name.toLowerCase()); // Fallback to mock data
    }
  },
  
  create: async (site: Omit<BettingSite, 'id'>): Promise<BettingSite> => {
    console.log("[BettingSiteService] Creating site:", JSON.stringify(site, null, 2));
    
    // Verificar se todos os campos obrigatórios estão presentes
    if (!site.name || !site.url || !site.description || !site.category || !site.adminOwnerId) {
      console.error("[BettingSiteService] Missing required fields", {
        name: !!site.name,
        url: !!site.url,
        description: !!site.description,
        category: !!site.category,
        adminOwnerId: !!site.adminOwnerId
      });
      throw new Error("Missing required fields");
    }
    
    try {
      const supabaseData = {
        name: site.name,
        url: site.url,
        description: site.description,
        category: site.category,
        logo_url: site.logoUrl || null,
        registration_date: site.registrationDate.toISOString(),
        admin_owner_id: site.adminOwnerId,
        commission: site.commission || null,
        ltv: site.ltv || null
      };
      
      console.log("[BettingSiteService] Preparing Supabase data:", JSON.stringify(supabaseData, null, 2));
      
      // Verificar se a conexão com o Supabase está ativa
      const { error: pingError } = await supabase.from('betting_sites').select('count(*)');
      if (pingError) {
        console.error('[BettingSiteService] Supabase connection check failed:', pingError);
      } else {
        console.log('[BettingSiteService] Supabase connection check passed');
      }
      
      const { data, error } = await supabase
        .from('betting_sites')
        .insert(supabaseData)
        .select()
        .single();
      
      if (error) {
        console.error('[BettingSiteService] Error creating betting site in Supabase:', error);
        console.log('[BettingSiteService] Error details:', JSON.stringify(error, null, 2));
        console.log('[BettingSiteService] Using fallback with mock data');
        
        // Fallback to mock data
        const newSite = { ...site, id: String(bettingSites.length + 1) };
        bettingSites.push(newSite);
        console.log('[BettingSiteService] Site added to mock data:', newSite);
        return newSite;
      }
      
      console.log('[BettingSiteService] Site created in Supabase:', data);
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        logoUrl: data.logo_url || undefined,
        registrationDate: new Date(data.registration_date),
        adminOwnerId: data.admin_owner_id,
        commission: data.commission || undefined,
        ltv: data.ltv || undefined
      };
    } catch (error) {
      console.error('[BettingSiteService] Error in create:', error);
      console.error('[BettingSiteService] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Fallback to mock data
      const newSite = { ...site, id: String(bettingSites.length + 1) };
      bettingSites.push(newSite);
      console.log('[BettingSiteService] Site added to mock data (after exception):', newSite);
      return newSite;
    }
  },
  
  update: async (id: string, siteData: Partial<BettingSite>): Promise<BettingSite | null> => {
    try {
      // Convert BettingSite to Supabase format
      const updateData: any = {};
      if (siteData.name !== undefined) updateData.name = siteData.name;
      if (siteData.url !== undefined) updateData.url = siteData.url;
      if (siteData.description !== undefined) updateData.description = siteData.description;
      if (siteData.category !== undefined) updateData.category = siteData.category;
      if (siteData.logoUrl !== undefined) updateData.logo_url = siteData.logoUrl;
      if (siteData.commission !== undefined) updateData.commission = siteData.commission;
      if (siteData.ltv !== undefined) updateData.ltv = siteData.ltv;
      
      const { data, error } = await supabase
        .from('betting_sites')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error || !data) {
        console.error('Error updating betting site:', error);
        // Fallback to mock data
        const index = bettingSites.findIndex(site => site.id === id);
        if (index !== -1) {
          bettingSites[index] = { ...bettingSites[index], ...siteData };
          return bettingSites[index];
        }
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        logoUrl: data.logo_url || undefined,
        registrationDate: new Date(data.registration_date),
        adminOwnerId: data.admin_owner_id,
        commission: data.commission || undefined,
        ltv: data.ltv || undefined
      };
    } catch (error) {
      console.error('Error in update:', error);
      // Fallback to mock data
      const index = bettingSites.findIndex(site => site.id === id);
      if (index !== -1) {
        bettingSites[index] = { ...bettingSites[index], ...siteData };
        return bettingSites[index];
      }
      return null;
    }
  },
  
  delete: async (id: string): Promise<BettingSite | null> => {
    try {
      // Get site data before deletion
      const { data: siteData, error: getError } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (getError || !siteData) {
        console.error('Error getting betting site before deletion:', getError);
        // Fallback to mock data
        const index = bettingSites.findIndex(site => site.id === id);
        if (index !== -1) {
          const deleted = bettingSites.splice(index, 1);
          return deleted[0];
        }
        return null;
      }
      
      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from('betting_sites')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error deleting betting site:', deleteError);
        // Fallback to mock data
        const index = bettingSites.findIndex(site => site.id === id);
        if (index !== -1) {
          const deleted = bettingSites.splice(index, 1);
          return deleted[0];
        }
        return null;
      }
      
      return {
        id: siteData.id,
        name: siteData.name,
        url: siteData.url,
        description: siteData.description,
        category: siteData.category,
        logoUrl: siteData.logo_url || undefined,
        registrationDate: new Date(siteData.registration_date),
        adminOwnerId: siteData.admin_owner_id,
        commission: siteData.commission || undefined,
        ltv: siteData.ltv || undefined
      };
    } catch (error) {
      console.error('Error in delete:', error);
      // Fallback to mock data
      const index = bettingSites.findIndex(site => site.id === id);
      if (index !== -1) {
        const deleted = bettingSites.splice(index, 1);
        return deleted[0];
      }
      return null;
    }
  },
  
  exportToCsv: async (): Promise<string> => {
    try {
      // Get data from Supabase
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*');
      
      if (error) {
        console.error('Error fetching betting sites for export:', error);
        // Fallback to mock data
        const headers = ['name', 'url', 'description', 'categories', 'commission', 'ltv'];
        const rows = bettingSites.map(site => [
          site.name,
          site.url,
          site.description.replace(/"/g, '""'),
          site.category.join('|'),
          site.commission?.toString() || '',
          site.ltv?.toString() || ''
        ]);
        
        return [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
      }
      
      // Convert Supabase data to CSV
      const headers = ['name', 'url', 'description', 'categories', 'commission', 'ltv'];
      const rows = data.map(site => [
        site.name,
        site.url,
        site.description.replace(/"/g, '""'),
        site.category.join('|'),
        site.commission?.toString() || '',
        site.ltv?.toString() || ''
      ]);
      
      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
    } catch (error) {
      console.error('Error in exportToCsv:', error);
      // Fallback to mock data
      const headers = ['name', 'url', 'description', 'categories', 'commission', 'ltv'];
      const rows = bettingSites.map(site => [
        site.name,
        site.url,
        site.description.replace(/"/g, '""'),
        site.category.join('|'),
        site.commission?.toString() || '',
        site.ltv?.toString() || ''
      ]);
      
      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
    }
  },
  
  importFromCsv: async (csvData: string, userId: string) => {
    // This function is now replaced by direct implementation in the CsvImportExport component
    // We keep it for backward compatibility but it's not used anymore
    const result = {
      added: 0,
      updated: 0,
      errors: [] as string[]
    };
    
    const rows = csvData.split('\n');
    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Validate headers
    const requiredHeaders = ['name', 'url', 'description', 'categories'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      result.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      return result;
    }
    
    // Process rows
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows
      
      try {
        const values = rows[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        const nameIndex = headers.indexOf('name');
        const urlIndex = headers.indexOf('url');
        const descriptionIndex = headers.indexOf('description');
        const categoriesIndex = headers.indexOf('categories');
        const commissionIndex = headers.indexOf('commission');
        const ltvIndex = headers.indexOf('ltv');
        
        if (values.length < 4) {
          result.errors.push(`Row ${i}: Not enough values`);
          continue;
        }
        
        // Process the row data...
        // (This implementation is now in the CsvImportExport component)
      } catch (error) {
        result.errors.push(`Row ${i}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return result;
  }
};
