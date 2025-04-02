
import { bettingSites } from './models';
import { BettingSite } from '@/types';

export const bettingSiteService = {
  getAll: () => [...bettingSites],
  findById: (id: string) => bettingSites.find(site => site.id === id),
  findByCategory: (category: string) => 
    bettingSites.filter(site => site.category.includes(category)),
  findByName: (name: string) => 
    bettingSites.find(site => site.name.toLowerCase() === name.toLowerCase()),
  create: (site: Omit<BettingSite, 'id'>) => {
    const newSite = { ...site, id: String(bettingSites.length + 1) };
    bettingSites.push(newSite);
    return newSite;
  },
  update: (id: string, siteData: Partial<BettingSite>) => {
    const index = bettingSites.findIndex(site => site.id === id);
    if (index !== -1) {
      bettingSites[index] = { ...bettingSites[index], ...siteData };
      return bettingSites[index];
    }
    return null;
  },
  delete: (id: string) => {
    const index = bettingSites.findIndex(site => site.id === id);
    if (index !== -1) {
      const deleted = bettingSites.splice(index, 1);
      return deleted[0];
    }
    return null;
  },
  exportToCsv: () => {
    // Create CSV header
    const headers = ['name', 'url', 'description', 'categories', 'commission', 'ltv'];
    
    // Map sites to CSV rows
    const rows = bettingSites.map(site => [
      site.name,
      site.url,
      site.description.replace(/"/g, '""'), // Escape double quotes
      site.category.join('|'),
      site.commission?.toString() || '',
      site.ltv?.toString() || ''
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  },
  importFromCsv: (csvData: string, userId: string) => {
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
        
        const name = values[nameIndex];
        const url = values[urlIndex];
        const description = values[descriptionIndex];
        const categories = values[categoriesIndex].split('|');
        const commission = commissionIndex >= 0 ? parseFloat(values[commissionIndex]) || null : null;
        const ltv = ltvIndex >= 0 ? parseFloat(values[ltvIndex]) || null : null;
        
        // Check if site already exists
        const existingSite = bettingSiteService.findByName(name);
        
        if (existingSite) {
          // Update existing site
          bettingSiteService.update(existingSite.id, {
            url,
            description,
            category: categories,
            commission: isNaN(Number(commission)) ? existingSite.commission : commission,
            ltv: isNaN(Number(ltv)) ? existingSite.ltv : ltv
          });
          result.updated++;
        } else {
          // Add new site
          bettingSiteService.create({
            name,
            url,
            description,
            category: categories,
            registrationDate: new Date(),
            adminOwnerId: userId,
            logoUrl: `https://placehold.co/100x50/FFD760/151515?text=${encodeURIComponent(name)}`,
            commission: commission || undefined,
            ltv: ltv || undefined
          });
          result.added++;
        }
      } catch (error) {
        result.errors.push(`Row ${i}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return result;
  }
};
