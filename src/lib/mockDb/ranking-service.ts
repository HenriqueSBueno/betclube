
import { dailyRankings } from './models';
import { generateRankedSites } from './helpers';
import { rankingCategories } from './models';

export const rankingService = {
  getAll: () => [...dailyRankings],
  findById: (id: string) => dailyRankings.find(ranking => ranking.id === id),
  findByCategory: (categoryId: string) => 
    dailyRankings.find(ranking => ranking.categoryId === categoryId),
  regenerate: (
    categoryId: string, 
    siteCount: number = 10, 
    voteRange: { minVotes: number, maxVotes: number } = { minVotes: 0, maxVotes: 100 }
  ) => {
    const index = dailyRankings.findIndex(ranking => ranking.categoryId === categoryId);
    if (index !== -1) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const category = rankingCategories.find(c => c.id === categoryId);
      if (!category) return null;
      
      const newRanking = {
        id: dailyRankings[index].id,
        categoryId,
        categoryName: category.name,
        generationDate: now,
        expiration: tomorrow,
        sites: generateRankedSites(categoryId, siteCount, voteRange)
      };
      
      dailyRankings[index] = newRanking;
      return newRanking;
    }
    return null;
  }
};

// Create a function to generate initial daily rankings
const generateInitialDailyRankings = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return rankingCategories.map(category => ({
    id: category.id,
    categoryId: category.id,
    categoryName: category.name,
    generationDate: now,
    expiration: tomorrow,
    sites: generateRankedSites(category.id, 10, { minVotes: 0, maxVotes: 100 })
  }));
};

// Initialize daily rankings on first import
if (dailyRankings.length === 0) {
  const initialRankings = generateInitialDailyRankings();
  initialRankings.forEach(ranking => dailyRankings.push(ranking));
}
