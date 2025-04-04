
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RankingCategory } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface RankingTestProps {
  categories: RankingCategory[];
}

export function RankingTest({ categories }: RankingTestProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || "");
  const [siteCount, setSiteCount] = useState<number>(10);
  const [minVotes, setMinVotes] = useState<number>(0);
  const [maxVotes, setMaxVotes] = useState<number>(100);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle form submission
  const handleGenerateRanking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Step 1: Update or insert ranking configuration
      const { error: configError } = await supabase
        .from('ranking_configs')
        .upsert(
          {
            category_id: selectedCategoryId,
            site_count: siteCount,
            min_votes: minVotes,
            max_votes: maxVotes,
            last_modified: new Date().toISOString()
          },
          { onConflict: 'category_id' }
        );
        
      if (configError) throw configError;
      
      // Step 2: Call the edge function to generate the ranking
      const response = await supabase.functions.invoke('generate_daily_ranking', {
        body: {
          category_id: selectedCategoryId,
          site_count: siteCount,
          min_votes: minVotes,
          max_votes: maxVotes
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      toast.success("Ranking generated successfully");
    } catch (error) {
      console.error("Error generating ranking:", error);
      toast.error("Failed to generate ranking: " + (error.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  // Get the selected category name
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Geração de Ranking</CardTitle>
        <CardDescription>
          Configurar e gerar ranking para uma categoria específica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateRanking} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={selectedCategoryId} 
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteCount">Número de Sites</Label>
            <Input
              id="siteCount"
              type="number"
              value={siteCount}
              onChange={(e) => setSiteCount(Number(e.target.value))}
              min={1}
              max={50}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minVotes">Votos Mínimos</Label>
            <Input
              id="minVotes"
              type="number"
              value={minVotes}
              onChange={(e) => setMinVotes(Number(e.target.value))}
              min={0}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxVotes">Votos Máximos</Label>
            <Input
              id="maxVotes"
              type="number"
              value={maxVotes}
              onChange={(e) => setMaxVotes(Number(e.target.value))}
              min={1}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isGenerating || !selectedCategoryId}
            className="w-full"
          >
            {isGenerating ? "Gerando..." : "Gerar Ranking"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
