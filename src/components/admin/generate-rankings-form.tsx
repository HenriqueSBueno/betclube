
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { RankingsService } from "@/services/rankings-service";
import { VotingService } from "@/services/voting-service";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RankingConfig } from "@/types";

const formSchema = z.object({
  siteCount: z.number().min(3, "Must include at least 3 sites").max(20, "Maximum 20 sites allowed"),
  voteRange: z.tuple([z.number(), z.number()])
    .refine(([min, max]) => min < max, {
      message: "Minimum votes must be less than maximum votes"
    })
});

interface GenerateRankingsFormProps {
  categoryId: string;
  onSuccess: () => void;
}

export function GenerateRankingsForm({ categoryId, onSuccess }: GenerateRankingsFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResettingVotes, setIsResettingVotes] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch ranking config if it exists
  const { data: config } = useQuery({
    queryKey: ['rankingConfig', categoryId],
    queryFn: async () => await RankingsService.getConfig(categoryId)
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteCount: config?.site_count || 10,
      voteRange: [config?.min_votes || 0, config?.max_votes || 100]
    }
  });
  
  // Update form when config is loaded
  React.useEffect(() => {
    if (config) {
      form.setValue("siteCount", config.site_count);
      form.setValue("voteRange", [config.min_votes, config.max_votes]);
    }
  }, [config, form]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    
    try {
      await RankingsService.regenerateRanking(
        categoryId,
        values.siteCount,
        { minVotes: values.voteRange[0], maxVotes: values.voteRange[1] }
      );
      
      toast({
        title: "Ranking generated",
        description: "The new ranking has been successfully generated."
      });
      
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Failed to generate the ranking. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleResetVotes = async () => {
    setIsResettingVotes(true);
    
    try {
      await VotingService.resetVotesForRanking(categoryId);
      
      toast({
        title: "Votes reset",
        description: "All votes for this category have been reset."
      });
      
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: "Failed to reset votes. Please try again."
      });
    } finally {
      setIsResettingVotes(false);
    }
  };
  
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
                  onChange={e => field.onChange(parseInt(e.target.value) || 10)}
                  min={3}
                  max={20}
                />
              </FormControl>
              <FormDescription>
                Number of betting sites to include in the ranking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="voteRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vote Range</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Slider
                    value={field.value}
                    min={0}
                    max={1000}
                    step={1}
                    onValueChange={field.onChange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {field.value[0]}</span>
                    <span>Max: {field.value[1]}</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Set the minimum and maximum number of votes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Ranking"}
          </Button>
          
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleResetVotes}
            disabled={isResettingVotes}
          >
            {isResettingVotes ? "Resetting..." : "Reset Votes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
