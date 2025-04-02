
import { RankedSite, BettingSite } from '@/types';
import { rankingCategories, bettingSites } from './models';

// Helper function to generate random ranked sites for a category
export const generateRankedSites = (
  categoryId: string, 
  siteCount: number = 10, 
  voteRange: { minVotes: number, maxVotes: number } = { minVotes: 0, maxVotes: 100 }
): RankedSite[] => {
  // Filter sites by category
  const categoryName = rankingCategories.find(c => c.id === categoryId)?.name || '';
  const filteredSites = bettingSites.filter(site => site.category.includes(categoryName));
  
  // Randomly select sites (or fewer if not enough)
  const selectedSites = [...filteredSites]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(siteCount, filteredSites.length));
  
  // Create ranked sites with random votes
  return selectedSites.map(site => ({
    siteId: site.id,
    site: site,
    votes: Math.floor(Math.random() * (voteRange.maxVotes - voteRange.minVotes + 1)) + voteRange.minVotes
  }));
};

// Generate initial daily rankings
export const generateDailyRankings = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return rankingCategories.map(category => ({
    id: category.id,
    categoryId: category.id,
    categoryName: category.name,
    generationDate: now,
    expiration: tomorrow,
    sites: generateRankedSites(category.id)
  }));
};
