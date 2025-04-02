
import { mockDb } from "@/lib/mockDb";
import { User } from "@/types";

export class VotingService {
  static hasVotedInRanking(user: User | null, rankingId: string, votedSiteIds: Record<string, boolean>): boolean {
    return votedSiteIds[rankingId] === true;
  }

  static registerVote(user: User, rankingId: string, siteId: string): void {
    // In a real app, we'd get the actual IP address
    const mockIp = "127.0.0.1";
    
    mockDb.votes.create({
      userId: user.id,
      rankingId,
      siteId,
      voteDate: new Date(),
      ip: mockIp,
    });
    
    // Save the vote to localStorage
    const today = new Date().toISOString().split('T')[0];
    const storedVotes = localStorage.getItem(`userVotes_${user.id}_${today}`);
    const votedSiteIds = storedVotes ? JSON.parse(storedVotes) : {};
    
    const updatedVotes = { ...votedSiteIds, [rankingId]: true };
    localStorage.setItem(`userVotes_${user.id}_${today}`, JSON.stringify(updatedVotes));
    
    return updatedVotes;
  }

  static loadUserVotes(user: User | null): Record<string, boolean> {
    if (!user) return {};
    
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const storedVotes = localStorage.getItem(`userVotes_${user.id}_${today}`);
    
    if (storedVotes) {
      return JSON.parse(storedVotes);
    }
    
    return {};
  }
}
