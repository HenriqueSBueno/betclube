
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { RankedSite, DailyRanking } from "@/types";
import { cn } from "@/lib/utils";

interface RankingListProps {
  ranking: DailyRanking | null;
  sites?: RankedSite[];
  onVote?: (rankingId: string, siteId: string, userId: string | null) => Promise<boolean>;
  isInteractive?: boolean;
}

export function RankingList({ ranking, sites = [], onVote, isInteractive = true }: RankingListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [votingId, setVotingId] = useState<string | null>(null);
  const [localSites, setSites] = useState<RankedSite[]>(sites);

  // Use the sites from the ranking object if no sites were provided
  const sitesToRender = sites.length > 0 ? sites : (ranking?.sites || []);

  const handleUpvote = async (siteId: string) => {
    if (!isInteractive || !onVote) return;
    
    try {
      setVotingId(siteId);
      
      // Para corrigir os erros de tipo, vamos garantir que passamos uma string para o ID do usuário
      const userId = user?.id || null;
      
      if (ranking?.id) {
        if (await onVote(ranking.id, siteId, userId)) {
          toast({
            title: "Voto registrado",
            description: "Seu voto foi contabilizado com sucesso!"
          });
          // Atualiza os votos localmente
          setSites(prevSites => prevSites.map(site => {
            if (site.siteId === siteId) {
              return { ...site, votes: site.votes + 1 };
            }
            return site;
          }));
        }
      }
    } catch (error: any) {
      console.error("Erro ao votar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao votar",
        description: error.message || "Não foi possível registrar seu voto. Tente novamente."
      });
    } finally {
      setVotingId(null);
    }
  };

  if (!ranking) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum ranking disponível</p>
      </div>
    );
  }

  if (sitesToRender.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum site neste ranking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sitesToRender.map((site, index) => (
        <Card key={site.siteId} className={cn(
          "transition-all",
          index < 3 ? "border-primary/50" : ""
        )}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full font-bold",
                index === 0 ? "bg-yellow-500 text-black" :
                index === 1 ? "bg-gray-300 text-black" :
                index === 2 ? "bg-amber-700 text-white" :
                "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </div>
              
              <div>
                <h3 className="font-medium">{site.site.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {site.votes} votos
                </p>
              </div>
            </div>
            
            {isInteractive && onVote && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUpvote(site.siteId)}
                disabled={votingId === site.siteId}
              >
                <ChevronUp className="mr-1 h-4 w-4" />
                Votar
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
