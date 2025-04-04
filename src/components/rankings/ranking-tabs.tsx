
import { useState, useEffect, useMemo } from "react";
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
  // Memoize sorted categories to prevent unnecessary calculations
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      if (a.position !== undefined && b.position !== undefined) {
        return a.position - b.position;
      }
      return 0;
    });
  }, [categories]);
  
  const [activeTab, setActiveTab] = useState(sortedCategories[0]?.id || "");
  
  // Update active tab if categories change
  useEffect(() => {
    if (sortedCategories.length > 0 && !sortedCategories.some(c => c.id === activeTab)) {
      setActiveTab(sortedCategories[0].id);
    }
  }, [sortedCategories, activeTab]);

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <ScrollArea className="w-full mb-6 sm:mb-8">
        <TabsList className="inline-flex w-auto min-w-full px-1 bg-secondary/20 dark:bg-secondary/20">
          {sortedCategories.map((category) => (
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
      
      {/* Only render the active tab content to reduce initial JS load */}
      {sortedCategories.map((category) => (
        <TabsContent 
          key={category.id} 
          value={category.id} 
          className="min-h-[40vh]"
          forceMount={activeTab === category.id}
        >
          {category.id === activeTab && (
            <RankingList 
              categoryId={category.id}
              onVote={onVote}
              isInteractive={isInteractive}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
