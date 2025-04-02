
import { votes, dailyRankings } from './models';
import { Vote } from '@/types';

export const voteService = {
  findByUserAndRanking: (userId: string, rankingId: string) => 
    votes.find(vote => vote.userId === userId && vote.rankingId === rankingId),
  findByIpAndRanking: (ip: string, rankingId: string) =>
    votes.find(vote => vote.ip === ip && vote.rankingId === rankingId),
  create: (vote: Omit<Vote, 'id'>) => {
    const newVote = { ...vote, id: String(votes.length + 1) };
    votes.push(newVote);
    
    // Update the site votes in the ranking
    const ranking = dailyRankings.find(r => r.id === vote.rankingId);
    if (ranking) {
      const site = ranking.sites.find(s => s.siteId === vote.siteId);
      if (site) {
        site.votes += 1;
      }
    }
    
    return newVote;
  },
  filterByRanking: (rankingId: string) => 
    votes.filter(vote => vote.rankingId === rankingId),
  delete: (id: string) => {
    const index = votes.findIndex(vote => vote.id === id);
    if (index !== -1) {
      const deleted = votes.splice(index, 1);
      return deleted[0];
    }
    return null;
  }
};
