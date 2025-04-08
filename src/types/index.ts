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
  admin_owner_id: string; // Changed from adminOwnerId to match database column name
  position: number | null; // Make position required to match database schema
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

// Add interface for RankingConfig to match database
export interface RankingConfig {
  id?: string;
  category_id: string;
  site_count: number;
  min_votes: number;
  max_votes: number;
  last_modified?: string;
}

export interface SiteManagementProps {
  onDataChange: () => void;
  categories?: RankingCategory[];
}

export interface RankingsManagementProps {
  onDataChange: () => void;
  categories?: RankingCategory[];
}

export interface SiteLabel {
  id: string;
  name: string;
  color: string;
  admin_owner_id: string;
  created_at: Date;
  updated_at: Date;
}
