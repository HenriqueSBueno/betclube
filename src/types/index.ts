
export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  registrationDate: Date;
  lastLogin: Date | null;
}

export interface BettingSite {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string[];
  logoUrl?: string;
  registrationDate: Date;
  adminOwnerId: string;
  commission?: number; // Campo de comissão (apenas para admins)
  ltv?: number; // Campo LTV - Lifetime Value (apenas para admins)
}

export interface RankingCategory {
  id: string;
  name: string;
  description: string;
  adminOwnerId: string;
}

export interface DailyRanking {
  id: string;
  categoryId: string;
  categoryName: string;
  generationDate: Date;
  expiration: Date;
  sites: RankedSite[];
}

export interface RankedSite {
  siteId: string;
  site: BettingSite;
  votes: number;
}

// Add this explicitly for use in SiteCard component
export type DailyRankingSite = RankedSite;

export interface Vote {
  id: string;
  userId?: string;
  rankingId: string;
  siteId: string;
  voteDate: Date;
  ip: string;
}

export interface SharedRanking {
  id: string;
  rankingId: string;
  sourceUserId: string;
  targetUserId?: string;
  uniqueToken: string;
  shareDate: Date;
  expirationDate: Date;
}
