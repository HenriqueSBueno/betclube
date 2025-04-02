import React from 'react';
import { SiteCard } from "./site-card";
import { RankedSite, DailyRanking } from "@/types";

interface RankingListProps {
  ranking?: DailyRanking;
  sites?: RankedSite[];
}

export function RankingList({ ranking, sites = [] }: RankingListProps) {
  // Use os sites do ranking se nenhum site foi fornecido
  const sitesToRender = sites.length > 0 ? sites : (ranking?.sites || []);

  // Ordenar sites por número de votos (decrescente)
  const sortedSites = [...sitesToRender].sort((a, b) => b.votes - a.votes);
  
  // Calcular o número máximo de votos para a barra de progresso
  const maxVotes = sortedSites[0]?.votes || 1;

  if (!ranking) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum ranking disponível</p>
      </div>
    );
  }

  if (sortedSites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum site neste ranking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedSites.map((site, index) => (
        <SiteCard
          key={site.siteId}
          rankedSite={site}
          index={index}
          maxVotes={maxVotes}
          isTopThree={index < 3}
        />
      ))}
    </div>
  );
}
