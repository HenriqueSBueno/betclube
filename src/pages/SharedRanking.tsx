
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockDb } from "@/lib/mockDb";
import { DailyRanking, SharedRanking as SharedRankingType } from "@/types";

const SharedRanking = () => {
  const { token } = useParams<{ token: string }>();
  const [sharedRanking, setSharedRanking] = useState<SharedRankingType | null>(null);
  const [ranking, setRanking] = useState<DailyRanking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Link de compartilhamento inválido");
      setIsLoading(false);
      return;
    }

    // Find the shared ranking by token
    const shared = mockDb.sharedRankings.findByToken(token);
    
    if (!shared) {
      setError("Ranking não encontrado ou link expirado");
      setIsLoading(false);
      return;
    }
    
    setSharedRanking(shared);
    
    // Find the actual ranking data
    const rankingData = mockDb.dailyRankings.findById(shared.rankingId);
    
    if (!rankingData) {
      setError("Dados do ranking não encontrados");
      setIsLoading(false);
      return;
    }
    
    setRanking(rankingData);
    setIsLoading(false);
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="animate-pulse text-lg">Carregando ranking compartilhado...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !ranking) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container py-8 flex flex-col items-center justify-center">
          <div className="text-xl text-destructive mb-4">{error || "Ocorreu um erro"}</div>
          <Link to="/">
            <Button>Ir para a Página Inicial</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Sort sites by votes in descending order
  const sortedSites = [...ranking.sites].sort((a, b) => b.votes - a.votes);
  
  // Calculate max votes for the progress bar
  const maxVotes = sortedSites[0]?.votes || 1;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-sm mb-4">
            Ranking Compartilhado
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Top {sortedSites.length} Sites de {ranking.categoryName} para Apostas
          </h1>
          <p className="text-muted-foreground">
            Compartilhado em {new Date(sharedRanking.shareDate).toLocaleDateString()}
          </p>
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
        
        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="outline">Ver Todos os Rankings</Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SharedRanking;
