
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

// Initialize daily rankings on first import
if (dailyRankings.length === 0) {
  const initialRankings = generateDailyRankings();
  initialRankings.forEach(ranking => dailyRankings.push(ranking));
}
