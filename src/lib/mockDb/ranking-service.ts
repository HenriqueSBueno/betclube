
import { dailyRankings } from './models';
import { generateRankedSites } from './helpers';
import { rankingCategories } from './models';

// Store ranking configurations for each category
export interface RankingConfiguration {
  categoryId: string;
  siteCount: number;
  voteRange: {
    minVotes: number;
    maxVotes: number;
  };
  lastModified: Date;
}

// Default configuration values
const DEFAULT_SITE_COUNT = 10;
const DEFAULT_MIN_VOTES = 0;
const DEFAULT_MAX_VOTES = 100;

// Store ranking configurations - make this a permanent object that persists between renders
const storedConfigurations = localStorage.getItem('rankingConfigurations');
export const rankingConfigurations: RankingConfiguration[] = storedConfigurations 
  ? JSON.parse(storedConfigurations) 
  : [];

// Helper function to save configurations to localStorage
const saveConfigurationsToStorage = () => {
  localStorage.setItem('rankingConfigurations', JSON.stringify(rankingConfigurations));
};

export const rankingService = {
  getAll: () => [...dailyRankings],
  findById: (id: string) => dailyRankings.find(ranking => ranking.id === id),
  findByCategory: (categoryId: string) => 
    dailyRankings.find(ranking => ranking.categoryId === categoryId),
  
  // Get configuration for a category
  getConfiguration: (categoryId: string): RankingConfiguration => {
    const config = rankingConfigurations.find(cfg => cfg.categoryId === categoryId);
    
    if (config) {
      return config;
    }
    
    // Create default configuration if none exists
    const newConfig: RankingConfiguration = {
      categoryId,
      siteCount: DEFAULT_SITE_COUNT,
      voteRange: {
        minVotes: DEFAULT_MIN_VOTES,
        maxVotes: DEFAULT_MAX_VOTES
      },
      lastModified: new Date()
    };
    
    rankingConfigurations.push(newConfig);
    saveConfigurationsToStorage(); // Save to localStorage
    return newConfig;
  },
  
  // Update configuration for a category
  updateConfiguration: (
    categoryId: string, 
    siteCount: number, 
    voteRange: { minVotes: number, maxVotes: number }
  ): RankingConfiguration => {
    const index = rankingConfigurations.findIndex(cfg => cfg.categoryId === categoryId);
    
    const updatedConfig: RankingConfiguration = {
      categoryId,
      siteCount,
      voteRange,
      lastModified: new Date()
    };
    
    if (index !== -1) {
      rankingConfigurations[index] = updatedConfig;
    } else {
      rankingConfigurations.push(updatedConfig);
    }

    saveConfigurationsToStorage(); // Save to localStorage
    
    return updatedConfig;
  },
  
  // Regenerate ranking using current configuration
  regenerate: (categoryId: string, siteCount?: number, voteRange?: { minVotes: number, maxVotes: number }) => {
    const index = dailyRankings.findIndex(ranking => ranking.categoryId === categoryId);
    if (index !== -1) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const category = rankingCategories.find(c => c.id === categoryId);
      if (!category) return null;
      
      // Get current configuration or update it if parameters provided
      let config = rankingService.getConfiguration(categoryId);
      
      if (siteCount !== undefined || voteRange !== undefined) {
        config = rankingService.updateConfiguration(
          categoryId,
          siteCount !== undefined ? siteCount : config.siteCount,
          voteRange !== undefined ? voteRange : config.voteRange
        );
      }
      
      const newRanking = {
        id: dailyRankings[index].id,
        categoryId,
        categoryName: category.name,
        generationDate: now,
        expiration: tomorrow,
        sites: generateRankedSites(categoryId, config.siteCount, config.voteRange)
      };
      
      dailyRankings[index] = newRanking;
      
      // Store the updated rankings in localStorage to persist across refreshes
      localStorage.setItem('dailyRankings', JSON.stringify(dailyRankings));
      
      return newRanking;
    }
    return null;
  },
  
  // Generate a new ranking batch at midnight using stored configurations
  generateDailyBatch: () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const updatedRankings = [];
    
    // Regenerate each category using its stored configuration
    for (const category of rankingCategories) {
      const index = dailyRankings.findIndex(ranking => ranking.categoryId === category.id);
      if (index !== -1) {
        const config = rankingService.getConfiguration(category.id);
        
        const newRanking = {
          id: dailyRankings[index].id,
          categoryId: category.id,
          categoryName: category.name,
          generationDate: now,
          expiration: tomorrow,
          sites: generateRankedSites(category.id, config.siteCount, config.voteRange)
        };
        
        dailyRankings[index] = newRanking;
        updatedRankings.push(newRanking);
      }
    }
    
    // Store the updated rankings in localStorage to persist across refreshes
    localStorage.setItem('dailyRankings', JSON.stringify(dailyRankings));
    
    return updatedRankings;
  }
};

// Create a function to generate initial daily rankings
const generateInitialDailyRankings = () => {
  // Try to load rankings from localStorage first
  const storedRankings = localStorage.getItem('dailyRankings');
  if (storedRankings) {
    const parsedRankings = JSON.parse(storedRankings);
    // Convert string dates back to Date objects
    parsedRankings.forEach(ranking => {
      ranking.generationDate = new Date(ranking.generationDate);
      ranking.expiration = new Date(ranking.expiration);
    });
    return parsedRankings;
  }
  
  // If no stored rankings, generate new ones
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return rankingCategories.map(category => {
    // Create default configuration for each category
    const config = rankingService.getConfiguration(category.id);
    
    return {
      id: category.id,
      categoryId: category.id,
      categoryName: category.name,
      generationDate: now,
      expiration: tomorrow,
      sites: generateRankedSites(category.id, config.siteCount, config.voteRange)
    };
  });
};

// Initialize daily rankings on first import
if (dailyRankings.length === 0) {
  const initialRankings = generateInitialDailyRankings();
  initialRankings.forEach(ranking => dailyRankings.push(ranking));
  
  // Store the initial rankings in localStorage
  localStorage.setItem('dailyRankings', JSON.stringify(dailyRankings));
}
