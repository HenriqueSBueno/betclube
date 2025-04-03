
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RankingCategory, DailyRanking } from "@/types";
import { RankingList } from "./ranking-list";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <ScrollArea className="w-full mb-6 sm:mb-8">
        <TabsList className="inline-flex w-auto min-w-full px-1 bg-secondary/20 dark:bg-secondary/20">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="text-xs sm:text-sm md:text-base py-2 px-3 sm:px-5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-background dark:data-[state=active]:text-background"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
      
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
