
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RankingsService } from "@/services/rankings-service";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { RankingCategory } from "@/types";
import { RankingTest } from "@/components/admin/ranking-test";
import { supabase } from "@/integrations/supabase/client";

interface RankingsManagementProps {
  categories: RankingCategory[];
  onDataChange: () => void;
}

export function RankingsManagement({ categories, onDataChange }: RankingsManagementProps) {
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  
  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ["rankings"],
    queryFn: async () => await RankingsService.getAllRankings(),
    enabled: categories.length > 0,
  });
  
  const handleGenerateAllRankings = async () => {
    if (isBatchGenerating) return;
    
    setIsBatchGenerating(true);
    
    try {
      // Process each category individually using the singular function
      const results = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const category of categories) {
        try {
          console.log(`Generating ranking for category ${category.name} (${category.id})`);
          
          // Get ranking config if it exists
          const { data: existingConfig } = await supabase
            .from('ranking_configs')
            .select('*')
            .eq('category_id', category.id)
            .maybeSingle();
          
          // Use config values or defaults
          const siteCount = existingConfig?.site_count || 10;
          const minVotes = existingConfig?.min_votes || 0;
          const maxVotes = existingConfig?.max_votes || 100;
          
          // Call generate_daily_ranking RPC function for this category
          const { data, error } = await supabase.rpc('generate_daily_ranking', {
            category_id: category.id,
            site_count: siteCount,
            min_votes: minVotes,
            max_votes: maxVotes
          });
          
          if (error) {
            console.error(`Error generating ranking for category ${category.name}:`, error);
            errorCount++;
            continue;
          }
          
          console.log(`Successfully generated ranking for ${category.name} with ID: ${data}`);
          results.push(data);
          successCount++;
        } catch (categoryError) {
          console.error(`Exception for category ${category.name}:`, categoryError);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        if (errorCount > 0) {
          toast.success(`${successCount} rankings generated successfully. ${errorCount} failed.`);
        } else {
          toast.success("Todos os rankings foram gerados com sucesso");
        }
        onDataChange();
      } else {
        toast.error("Falha ao gerar rankings. Nenhum ranking foi gerado.");
      }
    } catch (error) {
      toast.error("Falha ao gerar rankings");
      console.error("Erro ao gerar rankings:", error);
    } finally {
      setIsBatchGenerating(false);
    }
  };
  
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
        <RankingTest categories={categories} />
      )}
    </div>
  );
}
