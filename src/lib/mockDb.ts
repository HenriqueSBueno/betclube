
import { User, BettingSite, RankingCategory, DailyRanking, Vote, SharedRanking, UserRole, RankedSite } from '@/types';

// Mock users
const users: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    role: 'admin' as UserRole,
    registrationDate: new Date('2023-01-01'),
    lastLogin: new Date('2023-06-01')
  },
  {
    id: '2',
    email: 'user@example.com',
    role: 'user' as UserRole,
    registrationDate: new Date('2023-02-15'),
    lastLogin: new Date('2023-06-10')
  }
];

// Mock betting sites
const bettingSites: BettingSite[] = [
  {
    id: '1',
    name: 'Bet365',
    url: 'https://www.bet365.com',
    description: 'One of the world\'s leading online gambling companies.',
    category: ['Sports', 'Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Bet365',
    registrationDate: new Date('2022-01-01'),
    adminOwnerId: '1'
  },
  {
    id: '2',
    name: 'Betway',
    url: 'https://www.betway.com',
    description: 'A global online gambling company offering sports betting and casino games.',
    category: ['Sports', 'Casino', 'Poker'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Betway',
    registrationDate: new Date('2022-02-01'),
    adminOwnerId: '1'
  },
  {
    id: '3',
    name: 'PokerStars',
    url: 'https://www.pokerstars.com',
    description: 'The largest poker site in the world.',
    category: ['Poker', 'Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=PokerStars',
    registrationDate: new Date('2022-03-01'),
    adminOwnerId: '1'
  },
  {
    id: '4',
    name: 'William Hill',
    url: 'https://www.williamhill.com',
    description: 'One of the most trusted brands in the gambling industry.',
    category: ['Sports', 'Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=William+Hill',
    registrationDate: new Date('2022-04-01'),
    adminOwnerId: '1'
  },
  {
    id: '5',
    name: '888 Casino',
    url: 'https://www.888casino.com',
    description: 'Award-winning online casino with exclusive games.',
    category: ['Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=888+Casino',
    registrationDate: new Date('2022-05-01'),
    adminOwnerId: '1'
  },
  {
    id: '6',
    name: 'Unibet',
    url: 'https://www.unibet.com',
    description: 'Online gambling operator offering sports betting, poker, casino, and more.',
    category: ['Sports', 'Casino', 'Poker'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Unibet',
    registrationDate: new Date('2022-06-01'),
    adminOwnerId: '1'
  },
  {
    id: '7',
    name: 'LeoVegas',
    url: 'https://www.leovegas.com',
    description: 'Award-winning mobile casino experience.',
    category: ['Casino', 'Mobile'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=LeoVegas',
    registrationDate: new Date('2022-07-01'),
    adminOwnerId: '1'
  },
  {
    id: '8',
    name: 'Paddy Power',
    url: 'https://www.paddypower.com',
    description: 'Irish bookmaker offering sports betting, casino, poker, and bingo.',
    category: ['Sports', 'Casino', 'Poker'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Paddy+Power',
    registrationDate: new Date('2022-08-01'),
    adminOwnerId: '1'
  },
  {
    id: '9',
    name: 'Betsson',
    url: 'https://www.betsson.com',
    description: 'Leading online gambling company offering sports betting and casino games.',
    category: ['Sports', 'Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Betsson',
    registrationDate: new Date('2022-09-01'),
    adminOwnerId: '1'
  },
  {
    id: '10',
    name: 'Bwin',
    url: 'https://www.bwin.com',
    description: 'Sports betting, casino games, and poker.',
    category: ['Sports', 'Casino', 'Poker'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Bwin',
    registrationDate: new Date('2022-10-01'),
    adminOwnerId: '1'
  },
  {
    id: '11',
    name: 'Ladbrokes',
    url: 'https://www.ladbrokes.com',
    description: 'British betting and gambling company.',
    category: ['Sports', 'Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Ladbrokes',
    registrationDate: new Date('2022-11-01'),
    adminOwnerId: '1'
  },
  {
    id: '12',
    name: 'Mr Green',
    url: 'https://www.mrgreen.com',
    description: 'Award-winning online casino known for its unique gaming experience.',
    category: ['Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Mr+Green',
    registrationDate: new Date('2022-12-01'),
    adminOwnerId: '1'
  },
  {
    id: '13',
    name: 'Coral',
    url: 'https://www.coral.co.uk',
    description: 'British bookmaker established in 1926.',
    category: ['Sports', 'Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Coral',
    registrationDate: new Date('2023-01-01'),
    adminOwnerId: '1'
  },
  {
    id: '14',
    name: 'Betfair',
    url: 'https://www.betfair.com',
    description: 'World\'s largest betting exchange.',
    category: ['Sports', 'Exchange', 'Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Betfair',
    registrationDate: new Date('2023-02-01'),
    adminOwnerId: '1'
  },
  {
    id: '15',
    name: 'Casumo',
    url: 'https://www.casumo.com',
    description: 'Award-winning online casino with a unique adventure-style gaming experience.',
    category: ['Casino'],
    logoUrl: 'https://placehold.co/100x50/FFD760/151515?text=Casumo',
    registrationDate: new Date('2023-03-01'),
    adminOwnerId: '1'
  }
];

// Mock ranking categories
const rankingCategories: RankingCategory[] = [
  {
    id: '1',
    name: 'Sports',
    description: 'Best sports betting sites',
    adminOwnerId: '1'
  },
  {
    id: '2',
    name: 'Casino',
    description: 'Top online casinos',
    adminOwnerId: '1'
  },
  {
    id: '3',
    name: 'Poker',
    description: 'Leading poker platforms',
    adminOwnerId: '1'
  }
];

// Generate random ranked sites for a category
const generateRankedSites = (categoryId: string, siteCount: number = 10, voteRange: { minVotes: number, maxVotes: number } = { minVotes: 0, maxVotes: 100 }): RankedSite[] => {
  // Filter sites by category
  const categoryName = rankingCategories.find(c => c.id === categoryId)?.name || '';
  const filteredSites = bettingSites.filter(site => site.category.includes(categoryName));
  
  // Randomly select sites (or fewer if not enough)
  const selectedSites = [...filteredSites]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(siteCount, filteredSites.length));
  
  // Create ranked sites with random votes
  return selectedSites.map(site => ({
    siteId: site.id,
    site: site,
    votes: Math.floor(Math.random() * (voteRange.maxVotes - voteRange.minVotes + 1)) + voteRange.minVotes
  }));
};

// Generate mock daily rankings
const generateDailyRankings = (): DailyRanking[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return rankingCategories.map(category => ({
    id: category.id,
    categoryId: category.id,
    categoryName: category.name,
    generationDate: now,
    expiration: tomorrow,
    sites: generateRankedSites(category.id)
  }));
};

// Initialize daily rankings
const dailyRankings = generateDailyRankings();

// Mock votes
const votes: Vote[] = [];

// Mock shared rankings
const sharedRankings: SharedRanking[] = [];

// Mock database operations
export const mockDb = {
  // User operations
  users: {
    findByEmail: (email: string) => users.find(user => user.email === email),
    findById: (id: string) => users.find(user => user.id === id),
    create: (user: Omit<User, 'id'>) => {
      const newUser = { ...user, id: String(users.length + 1) };
      users.push(newUser);
      return newUser;
    },
    update: (id: string, userData: Partial<User>) => {
      const index = users.findIndex(user => user.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        return users[index];
      }
      return null;
    }
  },
  
  // Betting site operations
  bettingSites: {
    getAll: () => [...bettingSites],
    findById: (id: string) => bettingSites.find(site => site.id === id),
    findByCategory: (category: string) => 
      bettingSites.filter(site => site.category.includes(category)),
    create: (site: Omit<BettingSite, 'id'>) => {
      const newSite = { ...site, id: String(bettingSites.length + 1) };
      bettingSites.push(newSite);
      return newSite;
    },
    update: (id: string, siteData: Partial<BettingSite>) => {
      const index = bettingSites.findIndex(site => site.id === id);
      if (index !== -1) {
        bettingSites[index] = { ...bettingSites[index], ...siteData };
        return bettingSites[index];
      }
      return null;
    },
    delete: (id: string) => {
      const index = bettingSites.findIndex(site => site.id === id);
      if (index !== -1) {
        const deleted = bettingSites.splice(index, 1);
        return deleted[0];
      }
      return null;
    }
  },
  
  // Ranking category operations
  rankingCategories: {
    getAll: () => [...rankingCategories],
    findById: (id: string) => rankingCategories.find(category => category.id === id),
    create: (category: Omit<RankingCategory, 'id'>) => {
      const newCategory = { ...category, id: String(rankingCategories.length + 1) };
      rankingCategories.push(newCategory);
      return newCategory;
    },
    update: (id: string, categoryData: Partial<RankingCategory>) => {
      const index = rankingCategories.findIndex(category => category.id === id);
      if (index !== -1) {
        rankingCategories[index] = { ...rankingCategories[index], ...categoryData };
        return rankingCategories[index];
      }
      return null;
    },
    delete: (id: string) => {
      const index = rankingCategories.findIndex(category => category.id === id);
      if (index !== -1) {
        const deleted = rankingCategories.splice(index, 1);
        return deleted[0];
      }
      return null;
    }
  },
  
  // Daily ranking operations
  dailyRankings: {
    getAll: () => [...dailyRankings],
    findById: (id: string) => dailyRankings.find(ranking => ranking.id === id),
    findByCategory: (categoryId: string) => 
      dailyRankings.find(ranking => ranking.categoryId === categoryId),
    regenerate: (categoryId: string, siteCount: number = 10, voteRange: { minVotes: number, maxVotes: number } = { minVotes: 0, maxVotes: 100 }) => {
      const index = dailyRankings.findIndex(ranking => ranking.categoryId === categoryId);
      if (index !== -1) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const category = rankingCategories.find(c => c.id === categoryId);
        if (!category) return null;
        
        const newRanking = {
          id: dailyRankings[index].id,
          categoryId,
          categoryName: category.name,
          generationDate: now,
          expiration: tomorrow,
          sites: generateRankedSites(categoryId, siteCount, voteRange)
        };
        
        dailyRankings[index] = newRanking;
        return newRanking;
      }
      return null;
    }
  },
  
  // Vote operations
  votes: {
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
  },
  
  // Shared ranking operations
  sharedRankings: {
    findByToken: (token: string) => sharedRankings.find(sr => sr.uniqueToken === token),
    create: (sharedRanking: Omit<SharedRanking, 'id'>) => {
      const newSharedRanking = { ...sharedRanking, id: String(sharedRankings.length + 1) };
      sharedRankings.push(newSharedRanking);
      return newSharedRanking;
    }
  }
};
