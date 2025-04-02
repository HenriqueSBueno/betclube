
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateRankingsForm } from "@/components/admin/generate-rankings-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RankingsService } from "@/services/rankings-service";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { RankingCategory } from "@/types";
import { RankingTest } from "@/components/admin/ranking-test";

interface RankingsManagementProps {
  categories: RankingCategory[];
  onDataChange: () => void;
}

export function RankingsManagement({ categories, onDataChange }: RankingsManagementProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || "");
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  
  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ["rankings"],
    queryFn: async () => await RankingsService.getAllRankings(),
    enabled: categories.length > 0,
  });
  
  const handleGenerationSuccess = () => {
    onDataChange();
  };
  
  const handleGenerateAllRankings = async () => {
    if (isBatchGenerating) return;
    
    setIsBatchGenerating(true);
    
    try {
      await RankingsService.generateDailyBatch();
      
      toast.success("All rankings successfully generated");
      onDataChange();
    } catch (error) {
      toast.error("Failed to generate rankings");
      console.error("Error generating rankings:", error);
    } finally {
      setIsBatchGenerating(false);
    }
  };
  
  // Filter categories for the selected category
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const categoryRanking = rankings.find(r => r.categoryId === selectedCategoryId);
  
  // Filter the categories for the currently selected one
  const filteredCategories = selectedCategory ? [selectedCategory] : [];
  
  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Daily Rankings</h3>
          <p className="text-sm text-muted-foreground">
            Generate and manage daily rankings for each category
          </p>
        </div>
        
        <Button
          onClick={handleGenerateAllRankings}
          disabled={isBatchGenerating || categories.length === 0}
        >
          {isBatchGenerating ? "Generating..." : "Generate All Rankings"}
        </Button>
      </div>
      
      {categories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              No categories available. Add a category first.
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Category</CardTitle>
              <CardDescription>
                Choose a category to generate or update its ranking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger className="w-full md:w-[240px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Generate {selectedCategory.name} Ranking</CardTitle>
                <CardDescription>
                  Configure and generate the ranking for {selectedCategory.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenerateRankingsForm 
                  categories={filteredCategories}
                  onRankingGenerated={handleGenerationSuccess}
                />
                
                {categoryRanking && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-2">Current Ranking Info</h4>
                    <p className="text-sm text-muted-foreground">
                      Last generated: {new Date(categoryRanking.generationDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sites: {categoryRanking.sites.length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Add the testing component */}
          <RankingTest categories={categories} />
        </>
      )}
    </div>
  );
}
