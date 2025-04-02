
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RankingCategory, RankingConfig } from "@/types";
import { ArrowDown } from "lucide-react";
import { VotingService } from "@/services/voting-service";
import { RankingsService } from "@/services/rankings-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface GenerateRankingsFormProps {
  categories: RankingCategory[];
  onSuccess: () => void;
}

export function GenerateRankingsForm({ 
  categories, 
  onSuccess 
}: GenerateRankingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalSites, setTotalSites] = useState("10");
  const [minVotes, setMinVotes] = useState("0");
  const [maxVotes, setMaxVotes] = useState("100");
  
  // Buscar configuração atual quando a categoria é selecionada - fixed the useQuery hook
  const { data: currentConfig } = useQuery({
    queryKey: ['rankingConfig', selectedCategory],
    queryFn: () => RankingsService.getConfig(selectedCategory),
    enabled: !!selectedCategory,
    onSettled: (data) => {
      if (data) {
        setTotalSites(data.site_count.toString());
        setMinVotes(data.min_votes.toString());
        setMaxVotes(data.max_votes.toString());
      }
    }
  });
  
  // Mutação para regenerar ranking
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCategory) throw new Error("Nenhuma categoria selecionada");
      
      // Parse and validate inputs
      const sitesCount = parseInt(totalSites, 10);
      const minVotesCount = parseInt(minVotes, 10);
      const maxVotesCount = parseInt(maxVotes, 10);
      
      // Validação de entrada
      if (isNaN(sitesCount) || sitesCount < 1) {
        throw new Error("O número total de sites deve ser positivo");
      }
      
      if (isNaN(minVotesCount) || isNaN(maxVotesCount) || minVotesCount < 0 || maxVotesCount < minVotesCount) {
        throw new Error("Faixa de votos inválida");
      }
      
      // Obter o ranking existente para resetar votos
      const existingRanking = await RankingsService.getRankingByCategory(selectedCategory);
      if (existingRanking) {
        // Reset votes for this ranking
        await VotingService.resetVotesForRanking(existingRanking.id);
      }
      
      // Regenerar ranking
      return RankingsService.regenerateRanking(
        selectedCategory, 
        sitesCount, 
        { minVotes: minVotesCount, maxVotes: maxVotesCount }
      );
    },
    onSuccess: () => {
      toast({
        title: "Rankings gerados",
        description: "Novos rankings foram gerados com sucesso com a nova configuração."
      });
      
      // Invalidar consultas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      
      // Chamar callback de sucesso
      onSuccess();
    },
    onError: (error: Error) => {
      console.error("Falha ao gerar rankings:", error);
      toast({
        variant: "destructive",
        title: "Falha na geração",
        description: error.message || "Ocorreu um erro ao gerar os rankings."
      });
    }
  });

  const handleGenerate = async () => {
    if (!selectedCategory) {
      toast({
        variant: "destructive",
        title: "Nenhuma categoria selecionada",
        description: "Por favor, selecione uma categoria para gerar rankings."
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      await regenerateMutation.mutateAsync();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Category</label>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          disabled={isGenerating}
        >
          <SelectTrigger>
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
      </div>
      
      {currentConfig && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          <p className="font-medium mb-1">Current Configuration:</p>
          <p>Sites: {currentConfig.site_count}</p>
          <p>Votes Range: {currentConfig.min_votes} - {currentConfig.max_votes}</p>
          <p>Last Modified: {new Date(currentConfig.last_modified || '').toLocaleString()}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="totalSites" className="text-sm font-medium">
          Total Sites
        </label>
        <Input
          id="totalSites"
          type="number"
          min="1"
          value={totalSites}
          onChange={(e) => setTotalSites(e.target.value)}
          placeholder="Number of sites to include"
          disabled={isGenerating}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Random Votes Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="minVotes" className="text-xs text-muted-foreground">
              Minimum
            </label>
            <Input
              id="minVotes"
              type="number"
              min="0"
              value={minVotes}
              onChange={(e) => setMinVotes(e.target.value)}
              placeholder="Minimum votes"
              disabled={isGenerating}
            />
          </div>
          <div>
            <label htmlFor="maxVotes" className="text-xs text-muted-foreground">
              Maximum
            </label>
            <Input
              id="maxVotes" 
              type="number"
              min="0"
              value={maxVotes}
              onChange={(e) => setMaxVotes(e.target.value)}
              placeholder="Maximum votes"
              disabled={isGenerating}
            />
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleGenerate} 
        disabled={!selectedCategory || isGenerating || regenerateMutation.isPending}
        className="w-full"
      >
        {isGenerating || regenerateMutation.isPending ? (
          <>Generating...</>
        ) : (
          <>
            <ArrowDown className="mr-2 h-4 w-4" />
            Generate New Rankings
          </>
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground">
        This will replace the current daily rankings for the selected category with a new random selection using the specified configuration and reset all user votes. Future midnight regenerations will use this configuration until changed.
      </p>
    </div>
  );
}
