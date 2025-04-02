
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { DailyRanking } from "@/types";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { useToast } from "@/hooks/use-toast";
import { SiteCard } from "./site-card";
import { ShareDialog } from "./share-dialog";
import { VotingService } from "./voting-service";
import { ShareService } from "./share-service";

interface RankingListProps {
  ranking: DailyRanking;
}

export function RankingList({ ranking }: RankingListProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [votedSiteIds, setVotedSiteIds] = useState<Record<string, boolean>>({});

  // Sort sites by votes in descending order
  const sortedSites = [...ranking.sites].sort((a, b) => b.votes - a.votes);
  
  // Calculate max votes for the progress bar
  const maxVotes = sortedSites[0]?.votes || 1;

  // Load voted site IDs from localStorage when component mounts or ranking changes
  useEffect(() => {
    if (user) {
      const userVotes = VotingService.loadUserVotes(user);
      setVotedSiteIds(userVotes);
    }
  }, [user, ranking.id]);

  const hasVotedForSite = (siteId: string) => {
    return VotingService.hasVotedForSite(user, siteId, votedSiteIds);
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
    
    if (user) {
      const updatedVotes = VotingService.registerVote(user, ranking.id, siteId);
      setVotedSiteIds(updatedVotes);
      
      toast({
        title: "Voto registrado!",
        description: "Obrigado pelo seu voto",
      });
    }
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
