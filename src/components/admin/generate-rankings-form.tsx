
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { RankingConfig } from "@/types";
import { RankingsService } from "@/services/rankings-service";
import { VotingService } from "@/services/voting-service";

interface GenerateRankingsFormProps {
  categoryId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  siteCount: z.number().min(5).max(50),
  voteRange: z.array(z.number().min(0).max(1000)),
});

type FormValues = z.infer<typeof formSchema>;

export function GenerateRankingsForm({ categoryId, onSuccess }: GenerateRankingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<RankingConfig | null>(null);
  
  // Use React Query to fetch the config
  const { data: configData, isLoading } = useQuery({
    queryKey: ['rankingConfig', categoryId],
    queryFn: async () => {
      return await RankingsService.getConfig(categoryId);
    },
    onSuccess: (data) => {
      setConfig(data);
      if (data) {
        form.setValue("siteCount", data.site_count);
        form.setValue("voteRange", [data.min_votes, data.max_votes]);
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteCount: 10,
      voteRange: [0, 100],
    },
  });

  // No need for useEffect to update form values as we're doing it in the query's onSuccess callback

  const onSubmit = async (values: FormValues) => {
    setIsGenerating(true);
    
    try {
      await RankingsService.regenerateRanking(
        categoryId, 
        values.siteCount, 
        { 
          minVotes: values.voteRange[0], 
          maxVotes: values.voteRange[1] 
        }
      );
      
      // Reset votes for this ranking if needed
      await VotingService.resetVotesForRanking(categoryId);
      
      toast({
        title: "Ranking Generated",
        description: "The ranking has been successfully regenerated."
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['rankingConfig', categoryId] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error generating ranking:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate the ranking."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading configuration...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="siteCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Sites</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={isGenerating}
                  min={5}
                  max={50}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="voteRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vote Range (Min-Max)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    defaultValue={field.value}
                    max={1000}
                    step={1}
                    onValueChange={field.onChange}
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>Min: {field.value[0]}</div>
                    <div>Max: {field.value[1]}</div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isGenerating}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Ranking"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
