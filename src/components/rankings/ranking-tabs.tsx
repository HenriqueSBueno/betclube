
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RankingCategory, DailyRanking } from "@/types";
import { RankingList } from "./ranking-list";

interface RankingTabsProps {
  categories: RankingCategory[];
  rankings: DailyRanking[];
  onVote?: (rankingId: string, siteId: string, userId: string | null) => Promise<boolean>;
  isInteractive?: boolean;
}

export function RankingTabs({ categories, rankings, onVote, isInteractive = true }: RankingTabsProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || "");

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-3 mb-8">
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="text-base"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map((category) => {
        const ranking = rankings.find(r => r.categoryId === category.id);
        
        return (
          <TabsContent key={category.id} value={category.id}>
            {ranking ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    Top {ranking.sites.length} {category.name} Betting Sites
                  </h2>
                  <p className="text-muted-foreground">
                    Updated {new Date(ranking.generationDate).toLocaleDateString()}
                  </p>
                </div>
                <RankingList 
                  ranking={ranking} 
                  sites={ranking.sites}
                  onVote={onVote}
                  isInteractive={isInteractive}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p>No ranking data available for this category.</p>
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
