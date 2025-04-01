
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
