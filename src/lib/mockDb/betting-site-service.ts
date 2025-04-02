
import { bettingSites } from './models';
import { BettingSite } from '@/types';

export const bettingSiteService = {
  getAll: () => [...bettingSites],
  findById: (id: string) => bettingSites.find(site => site.id === id),
  findByCategory: (category: string) => 
    bettingSites.filter(site => site.category.includes(category)),
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
  }
};
