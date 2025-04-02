
import { mockDb } from "@/lib/mockDb";
import { User } from "@/types";

export class ShareService {
  static generateShareLink(rankingId: string, user: User | null): string {
    // Generate a fake unique token for sharing
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/shared/${token}`;
    
    if (user) {
      mockDb.sharedRankings.create({
        rankingId: rankingId,
        sourceUserId: user.id,
        uniqueToken: token,
        shareDate: new Date(),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }
    
    return link;
  }
}
