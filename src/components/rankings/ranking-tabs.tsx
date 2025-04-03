
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RankingCategory, DailyRanking } from "@/types";
import { RankingList } from "./ranking-list";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingTabsProps {
  categories: RankingCategory[];
  rankings: DailyRanking[];
  onVote?: (rankingId: string, siteId: string, userId: string | null) => Promise<boolean>;
  isInteractive?: boolean;
}

export function RankingTabs({ categories, rankings, onVote, isInteractive = true }: RankingTabsProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || "");
  const isMobile = useIsMobile();

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className={`grid ${categories.length <= 3 ? `grid-cols-${categories.length}` : isMobile ? 'grid-cols-2' : 'grid-cols-3'} mb-6 sm:mb-8 overflow-x-auto`}>
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="text-xs sm:text-sm md:text-base py-2 px-2 sm:px-4 whitespace-nowrap"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="min-h-[40vh]">
          <RankingList 
            categoryId={category.id}
            onVote={onVote}
            isInteractive={isInteractive}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
