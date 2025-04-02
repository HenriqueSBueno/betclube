
import { rankingService } from '../ranking-service';
import { dailyRankings } from '../models';

describe('Ranking Service', () => {
  test('getAll returns all rankings', () => {
    const rankings = rankingService.getAll();
    expect(rankings.length).toBe(dailyRankings.length);
    expect(rankings).not.toBe(dailyRankings); // Should return a copy
  });
  
  test('findById returns correct ranking', () => {
    if (dailyRankings.length === 0) return; // Skip if no rankings
    const ranking = rankingService.findById(dailyRankings[0].id);
    expect(ranking).toBeDefined();
    expect(ranking?.id).toBe(dailyRankings[0].id);
  });
  
  test('findByCategory returns ranking for category', () => {
    if (dailyRankings.length === 0) return; // Skip if no rankings
    const categoryId = dailyRankings[0].categoryId;
    const ranking = rankingService.findByCategory(categoryId);
    expect(ranking).toBeDefined();
    expect(ranking?.categoryId).toBe(categoryId);
  });
  
  test('regenerate updates ranking with new settings', () => {
    if (dailyRankings.length === 0) return; // Skip if no rankings
    const categoryId = dailyRankings[0].categoryId;
    const siteCount = 5;
    const voteRange = { minVotes: 10, maxVotes: 20 };
    
    const newRanking = rankingService.regenerate(categoryId, siteCount, voteRange);
    expect(newRanking).toBeDefined();
    expect(newRanking?.sites.length).toBe(siteCount);
    
    // Check vote range (might be less if not enough sites available)
    newRanking?.sites.forEach(site => {
      if (site.votes < voteRange.minVotes || site.votes > voteRange.maxVotes) {
        expect(true).toBe(false); // Should not happen
      }
    });
    
    // Check it was updated in the array
    const found = rankingService.findById(dailyRankings[0].id);
    expect(found?.sites.length).toBe(siteCount);
  });
});
