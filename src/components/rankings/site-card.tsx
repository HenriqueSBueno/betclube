import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RankedSite } from "@/types";

interface SiteCardProps {
  rankedSite: RankedSite;
  index: number;
  maxVotes: number;
  isTopThree: boolean;
}

export function SiteCard({
  rankedSite,
  index,
  maxVotes,
  isTopThree,
}: SiteCardProps) {
  return (
    <Card 
      key={rankedSite.siteId} 
      className={`overflow-hidden transition-all ${
        isTopThree 
          ? 'border-yellow-400 dark:border-yellow-500 border-2 shadow-lg' 
          : ''
      }`}
    >
      <CardContent className={`p-4 ${
        isTopThree 
          ? 'bg-amber-50 dark:bg-amber-950/50' 
          : ''
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className={`text-2xl font-bold ${
              isTopThree 
                ? 'text-amber-500 dark:text-amber-400' 
                : 'text-primary'
            }`}>
              #{index + 1}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 text-black border-none"
            >
              <ArrowUp className="h-4 w-4" />
              Votar
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">
                  {rankedSite.site.name}
                </h3>
                {isTopThree && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-400 dark:bg-amber-500 text-black">
                    <TrendingUp className="h-3 w-3 mr-1" /> Trending
                  </span>
                )}
              </div>
              <Button 
                variant="outline"
                size="sm"
                className={`${
                  isTopThree 
                    ? 'bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 text-black border-none' 
                    : ''
                }`}
                asChild
              >
                <a
                  href={rankedSite.site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visitar Site
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {rankedSite.site.description}
            </p>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Popularidade</span>
                <span className="text-xs font-medium">{rankedSite.votes} votos</span>
              </div>
              <Progress
                value={(rankedSite.votes / maxVotes) * 100}
                className={`h-2 ${
                  isTopThree 
                    ? 'bg-amber-200 dark:bg-amber-900' 
                    : ''
                }`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
