
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { DailyRanking } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, Share } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { mockDb } from "@/lib/mockDb";
import { useToast } from "@/hooks/use-toast";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      const storedVotes = localStorage.getItem(`userVotes_${user.id}_${today}`);
      if (storedVotes) {
        setVotedSiteIds(JSON.parse(storedVotes));
      } else {
        setVotedSiteIds({});
      }
    }
  }, [user, ranking.id]);

  const hasVotedInRanking = (rankingId: string) => {
    return votedSiteIds[rankingId];
  };

  const handleVote = async (siteId: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (hasVotedInRanking(ranking.id)) {
      toast({
        title: "Já votou",
        description: "Você já votou nesta lista hoje",
        variant: "destructive",
      });
      return;
    }
    
    if (user) {
      // In a real app, we'd get the actual IP address
      const mockIp = "127.0.0.1";
      
      mockDb.votes.create({
        userId: user.id,
        rankingId: ranking.id,
        siteId,
        voteDate: new Date(),
        ip: mockIp,
      });
      
      // Save the vote to localStorage
      const today = new Date().toISOString().split('T')[0];
      const updatedVotes = { ...votedSiteIds, [ranking.id]: true };
      localStorage.setItem(`userVotes_${user.id}_${today}`, JSON.stringify(updatedVotes));
      setVotedSiteIds(updatedVotes);
      
      toast({
        title: "Voto registrado!",
        description: "Obrigado pelo seu voto",
      });
    }
  };

  const handleShare = () => {
    // Generate a fake unique token for sharing
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/shared/${token}`;
    
    if (user) {
      mockDb.sharedRankings.create({
        rankingId: ranking.id,
        sourceUserId: user.id,
        uniqueToken: token,
        shareDate: new Date(),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }
    
    setShareLink(link);
    setIsShareDialogOpen(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copiado",
      description: "Link da classificação copiado para a área de transferência",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleShare} className="gap-2">
          <Share className="h-4 w-4" />
          Compartilhar
        </Button>
      </div>
      
      <div className="space-y-4">
        {sortedSites.map((rankedSite, index) => (
          <Card 
            key={rankedSite.siteId} 
            className="overflow-hidden ranking-card-hover"
          >
            <CardContent className="p-0">
              <div className="flex items-center p-4 md:p-6">
                <div className="flex-shrink-0 mr-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    #{index + 1}
                  </div>
                  <Button
                    size="sm"
                    className={`vote-button ${hasVotedInRanking(ranking.id) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => handleVote(rankedSite.siteId)}
                    disabled={hasVotedInRanking(ranking.id)}
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Votar
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium truncate">
                        {rankedSite.site.name}
                      </h3>
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
                        <Button variant="outline" size="sm">
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
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Compartilhar essa classificação</DialogTitle>
            <DialogDescription>
              Copie o link abaixo para compartilhar essa classificação com outros.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="bg-muted p-2 rounded-md text-sm truncate">
                {shareLink}
              </div>
            </div>
            <Button onClick={copyShareLink}>Copiar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
