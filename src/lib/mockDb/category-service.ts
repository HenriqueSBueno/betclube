
import { rankingCategories } from './models';
import { RankingCategory } from '@/types';

export const categoryService = {
  getAll: () => [...rankingCategories],
  findById: (id: string) => rankingCategories.find(category => category.id === id),
  create: (category: Omit<RankingCategory, 'id' | 'position'>) => {
    // Find the highest position
    const highestPosition = rankingCategories.reduce(
      (max, cat) => Math.max(max, cat.position || 0), 
      -1
    );
    
    const newCategory = { 
      ...category, 
      id: String(rankingCategories.length + 1),
      position: highestPosition + 1 
    };
    
    rankingCategories.push(newCategory);
    return newCategory;
  },
  update: (id: string, categoryData: Partial<RankingCategory>) => {
    const index = rankingCategories.findIndex(category => category.id === id);
    if (index !== -1) {
      rankingCategories[index] = { ...rankingCategories[index], ...categoryData };
      return rankingCategories[index];
    }
    return null;
  },
  delete: (id: string) => {
    const index = rankingCategories.findIndex(category => category.id === id);
    if (index !== -1) {
      const deleted = rankingCategories.splice(index, 1);
      return deleted[0];
    }
    return null;
  }
};
