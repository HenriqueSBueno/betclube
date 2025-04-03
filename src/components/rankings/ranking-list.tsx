import React, { useState, useEffect } from 'react';
import { SiteCard } from "./site-card";
import { RankedSite, DailyRanking } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const { toast } = useToast();

  const fetchLatestData = async () => {
    if (!categoryId) {
      console.log("[RankingList] Sem categoryId, não é possível buscar dados");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[RankingList] Buscando dados mais recentes para categoria:", categoryId);

      const { data: ranking, error: rankingError } = await supabase
        .from("daily_rankings")
        .select("*")
        .eq("category_id", categoryId)
        .order("generation_date", { ascending: false })
        .limit(1)
        .single();

      if (rankingError) {
        console.error("[RankingList] Erro ao buscar ranking:", rankingError);
        throw rankingError;
      }

      if (!ranking) {
        console.log("[RankingList] Nenhum ranking encontrado");
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
            admin_owner_id
          )
        `)
        .eq("ranking_id", ranking.id)
        .order("votes", { ascending: false });

      if (sitesError) {
        console.error("[RankingList] Erro ao buscar sites:", sitesError);
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
          adminOwnerId: rs.site.admin_owner_id
        },
        votes: rs.votes,
        position: rs.position
      }));

      console.log("[RankingList] Dados atualizados:", formattedSites);
      setSites(formattedSites);

    } catch (error: any) {
      console.error("[RankingList] Erro ao buscar dados:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar ranking",
        description: "Não foi possível carregar os dados do ranking. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchLatestData();

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
          (payload) => {
            console.log("[RankingList] Recebida atualização em tempo real:", payload);
            fetchLatestData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [categoryId]);

  const handleVoteUpdate = (siteId: string, newVotes: number) => {
    setSites(prevSites => {
      const updatedSites = prevSites.map(site => 
        site.siteId === siteId 
          ? { ...site, votes: newVotes }
          : site
      );
      
      return [...updatedSites].sort((a, b) => b.votes - a.votes);
    });
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionUrl.trim()) {
      toast({
        variant: "destructive",
        title: "URL inválida",
        description: "Por favor, digite um link válido.",
      });
      return;
    }

    toast({
      title: "Sugestão enviada",
      description: "Obrigado pela sua contribuição!",
    });
    setSuggestionUrl('');
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
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">
          Top {sortedSites.length} Sites de {categoryName || "Apostas"}
        </h2>
      </div>
      <div className="space-y-4">
        {sortedSites.map((site, index) => (
          <SiteCard
            key={site.siteId}
            rankedSite={site}
            index={index}
            maxVotes={Math.max(...sortedSites.map(s => s.votes))}
            isTopThree={index < 3}
            rankingId={currentRankingId || ""}
            onVoteUpdate={handleVoteUpdate}
          />
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-muted">
        <div className="text-center mb-4">
          <p className="text-muted-foreground">Não encontrou o melhor site? Ajude os outros com seu link abaixo</p>
        </div>
        <form onSubmit={handleSubmitSuggestion} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            placeholder="https://seu-site-favorito.com"
            value={suggestionUrl}
            onChange={(e) => setSuggestionUrl(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">Enviar</Button>
        </form>
      </div>
    </>
  );
}
