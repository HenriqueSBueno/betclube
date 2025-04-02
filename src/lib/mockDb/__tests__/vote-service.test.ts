
import { voteService } from '../vote-service';
import { votes, dailyRankings } from '../models';

// Save original state
const originalVotes = [...votes];
let testRankingId = '';
let testSiteId = '';

// Setup test data
beforeAll(() => {
  if (dailyRankings.length > 0 && dailyRankings[0].sites.length > 0) {
    testRankingId = dailyRankings[0].id;
    testSiteId = dailyRankings[0].sites[0].siteId;
  } else {
    // Skip tests if no rankings
    console.warn('No test rankings available for vote tests');
  }
});

// Reset votes after each test
afterEach(() => {
  while (votes.length > originalVotes.length) votes.pop();
});

describe('Vote Service', () => {
  test('create adds new vote and updates ranking', () => {
    if (!testRankingId || !testSiteId) return; // Skip if no test data
    
    const newVote = {
      rankingId: testRankingId,
      siteId: testSiteId,
      userId: 'test-user',
      ip: '127.0.0.1',
      voteDate: new Date()
    };
    
    // Get initial votes for site
    const ranking = dailyRankings.find(r => r.id === testRankingId);
    const initialSite = ranking?.sites.find(s => s.siteId === testSiteId);
    const initialVotes = initialSite?.votes || 0;
    
    // Create vote
    const created = voteService.create(newVote);
    expect(created.id).toBeDefined();
    
    // Check that ranking site votes increased
    const updatedRanking = dailyRankings.find(r => r.id === testRankingId);
    const updatedSite = updatedRanking?.sites.find(s => s.siteId === testSiteId);
    const updatedVotes = updatedSite?.votes || 0;
    expect(updatedVotes).toBe(initialVotes + 1);
  });
  
  test('filterByRanking returns votes for ranking', () => {
    if (!testRankingId || !testSiteId) return; // Skip if no test data
    
    // Create test votes
    voteService.create({
      rankingId: testRankingId,
      siteId: testSiteId,
      userId: 'test-user-1',
      ip: '127.0.0.1',
      voteDate: new Date()
    });
    
    voteService.create({
      rankingId: testRankingId,
      siteId: testSiteId,
      userId: 'test-user-2',
      ip: '127.0.0.2',
      voteDate: new Date()
    });
    
    const rankingVotes = voteService.filterByRanking(testRankingId);
    expect(rankingVotes.length).toBeGreaterThan(0);
    rankingVotes.forEach(vote => {
      expect(vote.rankingId).toBe(testRankingId);
    });
  });
  
  test('delete removes vote', () => {
    if (!testRankingId || !testSiteId) return; // Skip if no test data
    
    // Create a vote to delete
    const newVote = voteService.create({
      rankingId: testRankingId,
      siteId: testSiteId,
      userId: 'test-user-delete',
      ip: '127.0.0.3',
      voteDate: new Date()
    });
    
    // Delete it
    const deleted = voteService.delete(newVote.id);
    expect(deleted?.id).toBe(newVote.id);
    
    // Check it's gone
    const allVotes = votes.filter(v => v.id === newVote.id);
    expect(allVotes.length).toBe(0);
  });
});
