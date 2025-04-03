import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RankingTabs } from "@/components/rankings/ranking-tabs";
import { RankingCategory, DailyRanking } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { RankingsService } from "@/services/rankings-service";
import { Check } from "lucide-react";
const Home = () => {
  // Buscar categorias
  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('ranking_categories').select('*');
      if (error) throw error;
      return data as RankingCategory[];
    }
  });

  // Buscar rankings
  const {
    data: rankings = [],
    isLoading: rankingsLoading
  } = useQuery({
    queryKey: ['rankings'],
    queryFn: async () => {
      return await RankingsService.getAllRankings();
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });
  const isLoading = categoriesLoading || rankingsLoading;
  return <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 bg-green-100 text-green-600 text-sm font-medium rounded-full">
            <Check className="h-4 w-4" /> 100% Gratuito
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Betclub Rankings
          </h1>
          <p className="text-xl max-w-2xl mx-auto font-normal text-inherit">As melhores bets do dia, eleitas pela por você e atualizadas para maximizar seus ganhos.</p>
        </div>
        
        {isLoading ? <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-lg">Carregando rankings...</div>
          </div> : <div className="relative">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5dff9_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            <RankingTabs categories={categories} rankings={rankings} />
          </div>}
      </main>
      
      <Footer />
    </div>;
};
export default Home;