
import { sharedRankings } from './models';
import { SharedRanking } from '@/types';

export const sharedRankingService = {
  findByToken: (token: string) => sharedRankings.find(sr => sr.uniqueToken === token),
  create: (sharedRanking: Omit<SharedRanking, 'id'>) => {
    const newSharedRanking = { ...sharedRanking, id: String(sharedRankings.length + 1) };
    sharedRankings.push(newSharedRanking);
    return newSharedRanking;
  }
};
