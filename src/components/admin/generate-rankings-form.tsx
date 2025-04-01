
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mockDb } from "@/lib/mockDb";
import { RankingCategory } from "@/types";
import { ArrowDown } from "lucide-react";

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

  const handleGenerate = async () => {
    if (!selectedCategory) {
      toast({
        variant: "destructive",
        title: "No category selected",
        description: "Please select a category to generate rankings."
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const newRanking = mockDb.dailyRankings.regenerate(selectedCategory);
      
      if (newRanking) {
        toast({
          title: "Rankings generated",
          description: `New ${newRanking.categoryName} rankings have been generated successfully.`
        });
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
        This will replace the current daily rankings for the selected category with a new random selection.
      </p>
    </div>
  );
}
