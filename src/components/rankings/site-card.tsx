
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, TrendingUp, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DailyRankingSite } from "@/types";

interface SiteCardProps {
  rankedSite: DailyRankingSite;
  index: number;
  maxVotes: number;
  isTopThree: boolean;
  hasVotedInRanking: boolean;
  onVote: (siteId: string) => void;
  isAuthenticated: boolean;
}

export function SiteCard({
  rankedSite,
  index,
  maxVotes,
  isTopThree,
  hasVotedInRanking,
  onVote,
  isAuthenticated,
}: SiteCardProps) {
  return (
    <Card 
      key={rankedSite.siteId} 
      className={`overflow-hidden ranking-card-hover transition-all ${isTopThree ? 'border-primary border-2 shadow-lg' : ''}`}
    >
      <CardContent className={`p-0 ${isTopThree ? 'bg-primary/10' : ''}`}>
        <div className="flex items-center p-4 md:p-6">
          <div className="flex-shrink-0 mr-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${isTopThree ? 'text-primary' : 'text-primary'}`}>
              #{index + 1}
            </div>
            <Button
              size="sm"
              className={`vote-button ${hasVotedInRanking ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => onVote(rankedSite.siteId)}
              disabled={!isAuthenticated || hasVotedInRanking}
              title={!isAuthenticated ? "Faça login para votar" : hasVotedInRanking ? "Você já votou nesta lista hoje" : "Votar neste site"}
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              Votar
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium truncate">
                    {rankedSite.site.name}
                  </h3>
                  {isTopThree && (
                    <Badge variant="default" className="animate-pulse bg-primary/80">
                      <TrendingUp className="h-3 w-3 mr-1" /> Trending
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {rankedSite.site.description}
                </p>
              </div>
              <div className="mt-2 md:mt-0 md:ml-4 flex-shrink-0">
                <a
                  href={rankedSite.site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button 
                    variant={isTopThree ? "default" : "outline"} 
                    size="sm"
                    className={isTopThree ? "animate-pulse group" : "group"}
                  >
                    {isTopThree && (
                      <Flame 
                        className="h-4 w-4 mr-1 text-orange-500 animate-pulse group-hover:animate-[bounce_0.5s_ease-in-out_infinite]" 
                        fill="orange"
                      />
                    )}
                    Visitar Site
                  </Button>
                </a>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Popularidade</span>
                <span className="text-xs font-medium">{rankedSite.votes} votos</span>
              </div>
              <Progress
                value={(rankedSite.votes / maxVotes) * 100}
                className={`h-2 ${isTopThree ? 'bg-muted/50' : ''}`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
