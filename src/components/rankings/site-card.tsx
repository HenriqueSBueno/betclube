import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RankedSite } from "@/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { VotingService } from "@/services/voting-service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SiteCardProps {
  rankedSite: RankedSite;
  index: number;
  maxVotes: number;
  isTopThree: boolean;
  rankingId: string;
  onVoteUpdate: (siteId: string, newVotes: number) => void;
}

export function SiteCard({
  rankedSite,
  index,
  maxVotes,
  isTopThree,
  rankingId,
  onVoteUpdate,
}: SiteCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [remainingVotes, setRemainingVotes] = useState(3);

  useEffect(() => {
    if (user) {
      // Carrega os votos do usuário
      VotingService.loadUserVotes(rankingId, user.id).then(votedSites => {
        setHasVoted(votedSites.includes(rankedSite.siteId));
      });

      // Carrega os votos restantes
      VotingService.getRemainingVotes(rankingId, user.id).then(remaining => {
        setRemainingVotes(remaining);
      });
    }
  }, [user, rankingId, rankedSite.siteId]);

  const handleVote = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para votar neste site",
        variant: "destructive",
      });
      return;
    }

    if (hasVoted) {
      toast({
        title: "Voto não permitido",
        description: "Você já votou neste site hoje",
        variant: "destructive",
      });
      return;
    }

    if (remainingVotes <= 0) {
      toast({
        title: "Limite de votos atingido",
        description: "Você já usou todos os seus votos para esta lista hoje",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVoting(true);
      const newVotes = await VotingService.registerVote(rankedSite.siteId, rankingId, user.id);
      onVoteUpdate(rankedSite.siteId, newVotes);
      setHasVoted(true);
      setRemainingVotes(prev => prev - 1);
      toast({
        title: "Voto registrado",
        description: "Seu voto foi contabilizado com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao votar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao votar",
        description: error.message || "Não foi possível registrar seu voto. Tente novamente.",
      });
    } finally {
      setIsVoting(false);
    }
  };

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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`flex items-center gap-1 ${
                      hasVoted 
                        ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                        : remainingVotes <= 0
                          ? 'bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700'
                          : 'bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600'
                    } text-black dark:text-white border-none ${
                      isVoting ? 'opacity-50 cursor-not-allowed' : ''
                    } vote-button`}
                    onClick={handleVote}
                    disabled={isVoting || hasVoted || remainingVotes <= 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                    Votar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {hasVoted 
                    ? "Você já votou neste site hoje"
                    : remainingVotes <= 0
                      ? "Você já usou todos os seus votos para esta lista hoje"
                      : `${remainingVotes} ${remainingVotes === 1 ? 'voto restante' : 'votos restantes'}`
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">
                  {rankedSite.site.name}
                </h3>
                {isTopThree && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-400 dark:bg-amber-500 text-black dark:text-white">
                    <TrendingUp className="h-3 w-3 mr-1" /> Trending
                  </span>
                )}
              </div>
              <Button 
                variant="outline"
                size="sm"
                className={`${
                  isTopThree 
                    ? 'bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 text-black dark:text-white border-none' 
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
