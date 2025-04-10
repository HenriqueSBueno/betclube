import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, TrendingUp, Flame, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RankedSite } from "@/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { VotingService } from "@/services/voting-service";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { SiteLabelService } from "@/services/site-label-service";

interface SiteCardProps {
  rankedSite: RankedSite;
  index: number;
  maxVotes: number;
  isInteractive: boolean;
  rankingId: string;
  onVote: (rankingId: string, siteId: string, userId: string) => Promise<boolean>;
}

const formatVotes = (votes: number): string => {
  if (votes >= 1000000) {
    return `${(votes / 1000000).toFixed(1)} milhões`;
  } else if (votes >= 1000) {
    return `${(votes / 1000).toFixed(1)} mil`;
  }
  return votes.toString();
};

export function SiteCard({
  rankedSite,
  index,
  maxVotes,
  isInteractive,
  rankingId,
  onVote
}: SiteCardProps) {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [remainingVotes, setRemainingVotes] = useState(3);
  const isMobile = useIsMobile();
  const [labels, setLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      VotingService.loadUserVotes(rankingId, user.id).then(votedSites => {
        setHasVoted(votedSites.includes(rankedSite.siteId));
      });

      VotingService.getRemainingVotes(rankingId, user.id).then(remaining => {
        setRemainingVotes(remaining);
      });
    }
  }, [user, rankingId, rankedSite.siteId]);

  // Load labels for all users (logged in or not)
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const labelsList = await SiteLabelService.getAll();
        const labelsMap: Record<string, string> = {};
        labelsList.forEach(label => {
          labelsMap[label.name] = label.color;
        });
        setLabels(labelsMap);
      } catch (error) {
        console.error("Error loading labels:", error);
      }
    };
    
    fetchLabels();
  }, []);

  const handleVote = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para votar neste site",
        variant: "destructive"
      });
      return;
    }
    if (hasVoted) {
      toast({
        title: "Voto não permitido",
        description: "Você já votou neste site hoje",
        variant: "destructive"
      });
      return;
    }
    if (remainingVotes <= 0) {
      toast({
        title: "Limite de votos atingido",
        description: "Você já usou todos os seus votos para esta lista hoje",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsVoting(true);
      const success = await onVote(rankingId, rankedSite.siteId, user.id);
      if (success) {
        setHasVoted(true);
        setRemainingVotes(prev => prev - 1);
        toast({
          title: "Voto registrado",
          description: "Seu voto foi contabilizado com sucesso!"
        });
      }
    } catch (error: any) {
      console.error("Erro ao votar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao votar",
        description: error.message || "Não foi possível registrar seu voto. Tente novamente."
      });
    } finally {
      setIsVoting(false);
    }
  };

  return <Card key={rankedSite.siteId} className={`overflow-hidden transition-all ${index < 3 ? 'border-primary dark:border-primary border-2 shadow-lg' : ''}`}>
      <CardContent className={`p-4 ${index < 3 ? 'bg-primary/10 dark:bg-primary/5' : ''}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={`flex ${isMobile ? 'flex-row justify-between w-full' : 'items-center sm:flex-col'} gap-2 sm:gap-3`}>
            <div className={`text-2xl font-bold ${index < 3 ? 'text-primary dark:text-primary' : 'text-primary'}`}>
              {index + 1}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" className={`flex items-center gap-1 ${isMobile ? 'w-auto px-3' : 'w-full sm:w-auto'} ${hasVoted ? 'bg-accent hover:bg-accent/90 dark:bg-accent dark:hover:bg-accent/90' : remainingVotes <= 0 ? 'bg-muted hover:bg-muted/90 dark:bg-muted dark:hover:bg-muted/90' : 'bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90'} text-black dark:text-black border-none ${isVoting ? 'opacity-50 cursor-not-allowed' : ''} vote-button`} onClick={handleVote} disabled={isVoting || hasVoted || remainingVotes <= 0 || !isInteractive}>
                    <ArrowUp className="h-4 w-4" />
                    <span className={isMobile ? 'sr-only' : 'hidden sm:inline'}>Votar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {hasVoted ? "Você já votou neste site hoje" : remainingVotes <= 0 ? "Você já usou todos os seus votos para esta lista hoje" : `${remainingVotes} ${remainingVotes === 1 ? 'voto restante' : 'votos restantes'}`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-medium line-clamp-1">
                  {rankedSite.site.name}
                </h3>
                <div className="flex flex-wrap gap-1 items-center">
                  {index < 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary dark:bg-primary text-background dark:text-background">
                      <TrendingUp className="h-3 w-3 mr-1" /> Em Alta
                    </span>
                  )}
                  
                  {/* Display site labels */}
                  {rankedSite.site.siteLabels?.map(labelName => {
                    const labelColor = labels[labelName];
                    return (
                      <Badge 
                        key={labelName} 
                        variant="custom"
                        className="text-xs text-white"
                        style={{
                          backgroundColor: labelColor || '#888888',
                          border: 'none'
                        }}
                      >
                        {labelName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <Button 
                variant={index < 3 ? "custom" : "outline"} 
                size="sm" 
                className={`w-full sm:w-auto mt-2 sm:mt-0 group relative overflow-hidden transition-all duration-300 ${index < 3 ? 'bg-secondary hover:bg-secondary/90 dark:bg-secondary dark:hover:bg-secondary/90 text-white dark:text-white border-none' : ''}`} 
                asChild
              >
                <a href={rankedSite.site.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  {index < 3 && <span className="flame-icon mr-1"><Flame size={16} className="text-primary" /></span>}
                  <span className="transition-all duration-300 group-hover:opacity-0 relative z-10">Visitar Site</span>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold whitespace-nowrap z-20">Ir agora!</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
                  <span className="absolute inset-0 z-0 bg-gradient-to-r from-secondary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {rankedSite.site.description}
            </p>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Popularidade</span>
                <span className="font-medium text-base text-left">{formatVotes(rankedSite.votes)} votos</span>
              </div>
              <Progress value={rankedSite.votes / maxVotes * 100} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}
