
import { mockDb } from "@/lib/mockDb";
import { AuthUser } from "@/types/auth-types";

export class VotingService {
  static VOTES_PER_RANKING = 3; // Maximum votes allowed per ranking

  static hasVotedForSite(user: AuthUser | null, siteId: string, votedSiteIds: Record<string, boolean>): boolean {
    if (!user) return false;
    return votedSiteIds[siteId] === true;
  }

  static getRemainingVotes(user: AuthUser | null, rankingId: string): number {
    if (!user) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const storedVotes = localStorage.getItem(`userVotes_${user.id}_${today}`);
    const votedSiteIds = storedVotes ? JSON.parse(storedVotes) : {};
    
    // Count votes used for this ranking
    let usedVotes = 0;
    Object.keys(votedSiteIds).forEach(key => {
      // Extract rankingId from the siteId-rankingId format
      const parts = key.split('_');
      if (parts.length === 2 && parts[1] === rankingId && votedSiteIds[key] === true) {
        usedVotes++;
      }
    });
    
    return Math.max(0, this.VOTES_PER_RANKING - usedVotes);
  }

  static registerVote(user: AuthUser, rankingId: string, siteId: string): Record<string, boolean> {
    // Check if user has votes remaining for this ranking
    const remainingVotes = this.getRemainingVotes(user, rankingId);
    if (remainingVotes <= 0) {
      throw new Error("Você já usou todos os seus votos para esta lista hoje");
    }
    
    // In a real app, we'd get the actual IP address
    const mockIp = "127.0.0.1";
    
    mockDb.votes.create({
      userId: user.id,
      rankingId,
      siteId,
      voteDate: new Date(),
      ip: mockIp,
    });
    
    // Save the vote to localStorage - now tracking by siteId_rankingId to handle multiple rankings
    const today = new Date().toISOString().split('T')[0];
    const storedVotes = localStorage.getItem(`userVotes_${user.id}_${today}`);
    const votedSiteIds = storedVotes ? JSON.parse(storedVotes) : {};
    
    const voteKey = `${siteId}_${rankingId}`;
    const updatedVotes = { ...votedSiteIds, [voteKey]: true };
    localStorage.setItem(`userVotes_${user.id}_${today}`, JSON.stringify(updatedVotes));
    
    return updatedVotes;
  }

  static loadUserVotes(user: AuthUser | null): Record<string, boolean> {
    if (!user) return {};
    
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const storedVotes = localStorage.getItem(`userVotes_${user.id}_${today}`);
    
    if (storedVotes) {
      return JSON.parse(storedVotes);
    }
    
    return {};
  }

  static getSiteVoteKey(siteId: string, rankingId: string): string {
    return `${siteId}_${rankingId}`;
  }
  
  static resetVotesForRanking(rankingId: string): void {
    // Reset votes in the mock database
    const votesToRemove = mockDb.votes.filterByRanking(rankingId);
    votesToRemove.forEach(vote => {
      mockDb.votes.delete(vote.id);
    });
    
    // Reset votes in localStorage for all users
    // Since we don't have access to all users here, we will just remove votes related to this ranking
    // from localStorage for the current browser
    const allKeys = Object.keys(localStorage);
    const voteKeys = allKeys.filter(key => key.startsWith('userVotes_'));
    
    voteKeys.forEach(key => {
      const storedVotes = localStorage.getItem(key);
      if (storedVotes) {
        const votedSiteIds = JSON.parse(storedVotes);
        const updatedVotes = { ...votedSiteIds };
        
        // Remove all votes for this ranking
        Object.keys(updatedVotes).forEach(voteKey => {
          // Each voteKey is in the format "siteId_rankingId"
          const parts = voteKey.split('_');
          if (parts.length === 2 && parts[1] === rankingId) {
            delete updatedVotes[voteKey];
          }
        });
        
        // Store the updated votes back to localStorage
        localStorage.setItem(key, JSON.stringify(updatedVotes));
      }
    });
  }
}
