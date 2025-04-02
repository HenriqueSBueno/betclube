import { User, BettingSite, RankingCategory, DailyRanking, Vote, SharedRanking } from '@/types';

// Mock data collections
export const users: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    role: 'admin',
    registrationDate: new Date('2023-01-01'),
    lastLogin: new Date('2023-06-01')
  },
  {
    id: '2',
    email: 'user@example.com',
    role: 'user',
    registrationDate: new Date('2023-02-15'),
    lastLogin: new Date('2023-06-10')
  }
];

export const bettingSites: BettingSite[] = [
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

export const rankingCategories: RankingCategory[] = [
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

export const votes: Vote[] = [];
export const sharedRankings: SharedRanking[] = [];
export const dailyRankings: DailyRanking[] = [];
