
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
import { mockDb } from "@/lib/mockDb";
import { RankingCategory } from "@/types";
import { ArrowDown } from "lucide-react";
import { VotingService } from "@/components/rankings/voting-service";
import { RankingConfiguration } from "@/lib/mockDb/ranking-service";

interface GenerateRankingsFormProps {
  categories: RankingCategory[];
  onSuccess: () => void;
}

export function GenerateRankingsForm({ 
  categories, 
  onSuccess 
}: GenerateRankingsFormProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalSites, setTotalSites] = useState("10");
  const [minVotes, setMinVotes] = useState("0");
  const [maxVotes, setMaxVotes] = useState("100");
  const [currentConfig, setCurrentConfig] = useState<RankingConfiguration | null>(null);

  // Load configuration when category changes
  useEffect(() => {
    if (selectedCategory) {
      const config = mockDb.dailyRankings.getConfiguration(selectedCategory);
      setCurrentConfig(config);
      setTotalSites(config.siteCount.toString());
      setMinVotes(config.voteRange.minVotes.toString());
      setMaxVotes(config.voteRange.maxVotes.toString());
    }
  }, [selectedCategory]);

  const handleGenerate = async () => {
    if (!selectedCategory) {
      toast({
        variant: "destructive",
        title: "No category selected",
        description: "Please select a category to generate rankings."
      });
      return;
    }
    
    // Parse and validate inputs
    const sitesCount = parseInt(totalSites, 10);
    const minVotesCount = parseInt(minVotes, 10);
    const maxVotesCount = parseInt(maxVotes, 10);
    
    if (isNaN(sitesCount) || sitesCount < 1) {
      toast({
        variant: "destructive",
        title: "Invalid sites count",
        description: "Total sites must be a positive number."
      });
      return;
    }
    
    if (isNaN(minVotesCount) || isNaN(maxVotesCount) || minVotesCount < 0 || maxVotesCount < minVotesCount) {
      toast({
        variant: "destructive",
        title: "Invalid votes range",
        description: "Min votes must be non-negative and max votes must be greater than or equal to min votes."
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Get the existing ranking to reset votes
      const existingRanking = mockDb.dailyRankings.findByCategory(selectedCategory);
      if (existingRanking) {
        // Reset votes for this ranking
        VotingService.resetVotesForRanking(existingRanking.id);
      }
      
      const newRanking = mockDb.dailyRankings.regenerate(
        selectedCategory, 
        sitesCount, 
        { minVotes: minVotesCount, maxVotes: maxVotesCount }
      );
      
      if (newRanking) {
        toast({
          title: "Rankings generated",
          description: `New ${newRanking.categoryName} rankings have been generated successfully with the new configuration.`
        });
        
        // Call onSuccess to refresh the UI
        onSuccess();
      } else {
        throw new Error("Failed to generate rankings");
      }
    } catch (error) {
      console.error("Failed to generate rankings:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "An error occurred while generating rankings."
      });
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
          <p>Sites: {currentConfig.siteCount}</p>
          <p>Votes Range: {currentConfig.voteRange.minVotes} - {currentConfig.voteRange.maxVotes}</p>
          <p>Last Modified: {new Date(currentConfig.lastModified).toLocaleString()}</p>
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
        disabled={!selectedCategory || isGenerating}
        className="w-full"
      >
        {isGenerating ? (
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
