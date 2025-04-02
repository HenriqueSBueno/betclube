
import { userService } from './mockDb/user-service';
import { bettingSiteService } from './mockDb/betting-site-service';
import { categoryService } from './mockDb/category-service';
import { rankingService } from './mockDb/ranking-service';
import { voteService } from './mockDb/vote-service';
import { sharedRankingService } from './mockDb/shared-ranking-service';

// Export a unified mockDb API
export const mockDb = {
  users: userService,
  bettingSites: bettingSiteService,
  rankingCategories: categoryService,
  dailyRankings: rankingService,
  votes: voteService,
  sharedRankings: sharedRankingService
};
