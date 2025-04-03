import React, { useState, useEffect } from 'react';
import { SiteCard } from "./site-card";
import { RankedSite, DailyRanking } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Função para buscar os dados mais recentes
  const fetchLatestData = async () => {
    if (!categoryId) {
      console.log("[RankingList] Sem categoryId, não é possível buscar dados");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[RankingList] Buscando dados mais recentes para categoria:", categoryId);

      // Busca o ranking mais recente da categoria
      const { data: ranking, error: rankingError } = await supabase
        .from("daily_rankings")
        .select("id")
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

      // Busca os sites do ranking
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
            logo_url
          )
        `)
        .eq("ranking_id", ranking.id)
        .order("position", { ascending: true });

      if (sitesError) {
        console.error("[RankingList] Erro ao buscar sites:", sitesError);
        throw sitesError;
      }

      // Transforma os dados para o formato esperado
      const formattedSites = rankedSites.map(rs => ({
        siteId: rs.site_id,
        site: {
          id: rs.site.id,
          name: rs.site.name,
          description: rs.site.description,
          url: rs.site.url,
          logoUrl: rs.site.logo_url,
          category: [], // Campo obrigatório
          registrationDate: new Date(), // Campo obrigatório
          adminOwnerId: "" // Campo obrigatório
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

  // Efeito para buscar dados iniciais e se inscrever para atualizações
  useEffect(() => {
    if (categoryId) {
      fetchLatestData();

      // Se inscreve para atualizações em tempo real
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
            fetchLatestData(); // Atualiza os dados quando houver mudanças
          }
        )
        .subscribe();

      // Limpa a inscrição quando o componente é desmontado
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [categoryId]);

  // Função para atualizar o contador de votos localmente
  const handleVoteUpdate = (siteId: string, newVotes: number) => {
    setSites(prevSites => 
      prevSites.map(site => 
        site.siteId === siteId 
          ? { ...site, votes: newVotes }
          : site
      )
    );
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (sites.length === 0) {
    return <div>Nenhum site encontrado para esta categoria.</div>;
  }

  return (
    <div className="space-y-4">
      {sites.map((site, index) => (
        <SiteCard
          key={site.siteId}
          rankedSite={site}
          index={index}
          maxVotes={100}
          isTopThree={index < 3}
          rankingId={currentRankingId || ""}
          onVoteUpdate={handleVoteUpdate}
        />
      ))}
    </div>
  );
}
