
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { DailyRanking } from "@/types";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { useToast } from "@/hooks/use-toast";
import { SiteCard } from "./site-card";
import { ShareDialog } from "./share-dialog";
import { VotingService } from "@/services/voting-service";
import { ShareService } from "./share-service";
import { QueryClient, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface RankingListProps {
  ranking: DailyRanking;
}

export function RankingList({ ranking }: RankingListProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");

  // Sort sites by votes in descending order
  const sortedSites = [...ranking.sites].sort((a, b) => b.votes - a.votes);
  
  // Calculate max votes for the progress bar
  const maxVotes = sortedSites[0]?.votes || 1;

  // Consultar votos do usuário
  const { data: votedSiteIds = {} } = useQuery({
    queryKey: ['userVotes', user?.id, ranking.id],
    queryFn: () => VotingService.loadUserVotes(user?.id, ranking.id),
    enabled: !!user,
  });

  // Consultar votos restantes
  const { data: remainingVotes = 0 } = useQuery({
    queryKey: ['remainingVotes', user?.id, ranking.id],
    queryFn: () => VotingService.getRemainingVotes(user, ranking.id),
    enabled: !!user,
  });

  // Mutação para registrar voto
  const voteMutation = useMutation({
    mutationFn: async ({ siteId }: { siteId: string }) => {
      if (!user) throw new Error("Usuário não autenticado");
      return VotingService.registerVote(user, ranking.id, siteId);
    },
    onSuccess: () => {
      // Invalidar consultas para atualizar UI
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
      queryClient.invalidateQueries({ queryKey: ['remainingVotes'] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const hasVotedForSite = (siteId: string) => {
    const voteKey = VotingService.getSiteVoteKey(siteId, ranking.id);
    return votedSiteIds[voteKey] === true;
  };

  const handleVote = async (siteId: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (hasVotedForSite(siteId)) {
      toast({
        title: "Já votou",
        description: "Você já votou neste site hoje",
        variant: "destructive",
      });
      return;
    }
    
    // Registrar voto
    voteMutation.mutate({ siteId });
  };

  const handleShare = () => {
    const link = ShareService.generateShareLink(ranking.id, user);
    setShareLink(link);
    setIsShareDialogOpen(true);
  };

  // Function to determine if a site is in the top 3
  const isTopThreeSite = (index: number) => index < 3;

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleShare} className="gap-2">
          <Share className="h-4 w-4" />
          Compartilhar
        </Button>
      </div>
      
      <div className="space-y-4">
        {sortedSites.map((rankedSite, index) => {
          const isTopThree = isTopThreeSite(index);
          return (
            <SiteCard
              key={rankedSite.siteId}
              rankedSite={rankedSite}
              index={index}
              maxVotes={maxVotes}
              isTopThree={isTopThree}
              hasVotedForSite={hasVotedForSite(rankedSite.siteId)}
              onVote={handleVote}
              isAuthenticated={isAuthenticated}
              remainingVotes={remainingVotes}
              rankingId={ranking.id}
            />
          );
        })}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <ShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        shareLink={shareLink}
      />
    </div>
  );
}
