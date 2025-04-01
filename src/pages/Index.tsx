
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RankingTabs } from "@/components/rankings/ranking-tabs";
import { RankingCategory, DailyRanking } from "@/types";
import { mockDb } from "@/lib/mockDb";

const Index = () => {
  const [categories, setCategories] = useState<RankingCategory[]>([]);
  const [rankings, setRankings] = useState<DailyRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data from mock database
    const loadData = () => {
      setCategories(mockDb.rankingCategories.getAll());
      setRankings(mockDb.dailyRankings.getAll());
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Betting Buzz Rankings
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the top betting sites as voted by our community. Updated daily.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-lg">Loading rankings...</div>
          </div>
        ) : (
          <RankingTabs categories={categories} rankings={rankings} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
