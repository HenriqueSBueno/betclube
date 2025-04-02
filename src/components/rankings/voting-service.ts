
import { mockDb } from "@/lib/mockDb";
import { AuthUser } from "@/types/auth-types";

export class VotingService {
  static hasVotedForSite(user: AuthUser | null, siteId: string, votedSiteIds: Record<string, boolean>): boolean {
    if (!user) return false;
    return votedSiteIds[siteId] === true;
  }

  static registerVote(user: AuthUser, rankingId: string, siteId: string): Record<string, boolean> {
    // In a real app, we'd get the actual IP address
    const mockIp = "127.0.0.1";
    
    mockDb.votes.create({
      userId: user.id,
      rankingId,
      siteId,
      voteDate: new Date(),
      ip: mockIp,
    });
    
    // Save the vote to localStorage - now tracking by siteId instead of rankingId
    const today = new Date().toISOString().split('T')[0];
    const storedVotes = localStorage.getItem(`userVotes_${user.id}_${today}`);
    const votedSiteIds = storedVotes ? JSON.parse(storedVotes) : {};
    
    const updatedVotes = { ...votedSiteIds, [siteId]: true };
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
}
