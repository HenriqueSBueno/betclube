import React, { useState, useEffect, useCallback } from 'react';
import { SiteCard } from "./site-card";
import { RankedSite, DailyRanking } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { URLInput } from "@/components/ui/url-input";
import { SiteSuggestionService } from "@/services/site-suggestion-service";
import { useAuth } from '@/hooks/use-auth';
import { VotingService } from '@/services/voting.service';

interface RankingListProps {
  categoryId?: string;
  ranking?: DailyRanking;
  sites?: RankedSite[];
  onVote?: (rankingId: string, siteId: string, userId: string | null) => Promise<boolean>;
  isInteractive?: boolean;
}

export function RankingList({ 
  categoryId, 
  ranking, 
  sites: initialSites, 
  onVote, 
  isInteractive = true 
}: RankingListProps) {
  const [sites, setSites] = useState<RankedSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRankingId, setCurrentRankingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [suggestionUrl, setSuggestionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Optimized fetch function using useCallback to prevent unnecessary re-renders
  const fetchLatestData = useCallback(async () => {
    if (!categoryId) {
      return;
    }

    try {
      setIsLoading(true);

      const { data: ranking, error: rankingError } = await supabase
        .from("daily_rankings")
        .select("*")
        .eq("category_id", categoryId)
        .order("generation_date", { ascending: false })
        .limit(1)
        .single();

      if (rankingError) {
        throw rankingError;
      }

      if (!ranking) {
        setSites([]);
        setCurrentRankingId(null);
        return;
      }

      setCurrentRankingId(ranking.id);
      setCategoryName(ranking.category_name);

      const { data: rankedSites, error: sitesError } = await supabase
        .from("ranked_sites")
        .select(`
          id,
          position,
          votes,
          site_id,
          site:betting_sites (
            id,
            name,
            description,
            url,
            logo_url,
            category,
            registration_date,
            admin_owner_id,
            site_labels
          )
        `)
        .eq("ranking_id", ranking.id)
        .order("votes", { ascending: false });

      if (sitesError) {
        throw sitesError;
      }

      const formattedSites = rankedSites.map(rs => ({
        siteId: rs.site_id,
        site: {
          id: rs.site.id,
          name: rs.site.name,
          description: rs.site.description,
          url: rs.site.url,
          logoUrl: rs.site.logo_url,
          category: rs.site.category || [],
          registrationDate: new Date(rs.site.registration_date),
          adminOwnerId: rs.site.admin_owner_id,
          siteLabels: rs.site.site_labels || []
        },
        votes: rs.votes,
        position: rs.position
      }));

      setSites(formattedSites);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar ranking",
        description: "Não foi possível carregar os dados do ranking. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, toast]);

  useEffect(() => {
    if (categoryId) {
      fetchLatestData();

      // Set up real-time subscription
      const channel = supabase
        .channel(`ranked_sites:category=${categoryId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ranked_sites',
            filter: `ranking_id=eq.${currentRankingId}`
          },
          () => {
            fetchLatestData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [categoryId, currentRankingId, fetchLatestData]);

  const handleVoteUpdate = useCallback((siteId: string, newVotes: number) => {
    setSites(prevSites => {
      const updatedSites = prevSites.map(site => 
        site.siteId === siteId 
          ? { ...site, votes: newVotes }
          : site
      );
      
      return [...updatedSites].sort((a, b) => b.votes - a.votes);
    });
  }, []);

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para sugerir um site",
        variant: "destructive"
      });
      return;
    }

    if (!suggestionUrl) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await SiteSuggestionService.suggestSite(suggestionUrl, user.id);
      toast({
        title: "Sugestão enviada",
        description: "Sua sugestão foi enviada com sucesso!"
      });
      setSuggestionUrl('');
    } catch (error: any) {
      console.error("Erro ao sugerir site:", error);
      toast({
        variant: "destructive",
        title: "Erro ao sugerir site",
        description: error.message || "Não foi possível enviar sua sugestão. Tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (rankingId: string, siteId: string, userId: string) => {
    try {
      const newVotes = await VotingService.registerVote(siteId, rankingId, userId);
      return true;
    } catch (error) {
      console.error("Erro ao votar:", error);
      return false;
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (sites.length === 0) {
    return <div className="text-center py-8">
      <p>Nenhum site encontrado para esta categoria.</p>
    </div>;
  }

  const sortedSites = [...sites].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmitSuggestion} className="flex flex-col sm:flex-row gap-4">
        <URLInput
          value={suggestionUrl}
          onChange={(e) => setSuggestionUrl(e.target.value)}
          placeholder="Digite a URL do site que deseja sugerir"
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Sugerir Site"}
        </Button>
      </form>

      <div className="space-y-4">
        {sortedSites.map((site, index) => (
          <SiteCard
            key={site.siteId}
            rankedSite={site}
            index={index}
            maxVotes={Math.max(...sortedSites.map(s => s.votes))}
            isInteractive={isInteractive}
            rankingId={currentRankingId || ''}
            onVote={handleVote}
          />
        ))}
      </div>
    </div>
  );
}
