
// Import this file from the project and adapt it to fix the error with `useQuery` and the `onSettled` option
// We need to replace `onSettled` with the correct React Query structure
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useQueryClient } from "@tanstack/react-query";
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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing config for this category
  useEffect(() => {
    async function fetchConfig() {
      setIsLoading(true);
      try {
        const configData = await RankingsService.getConfig(categoryId);
        setConfig(configData);
      } catch (error) {
        console.error("Error fetching ranking config:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch ranking configuration."
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, [categoryId, toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteCount: config?.site_count || 10,
      voteRange: [config?.min_votes || 0, config?.max_votes || 100],
    },
  });

  // Update form values when config is loaded
  useEffect(() => {
    if (config) {
      form.setValue("siteCount", config.site_count);
      form.setValue("voteRange", [config.min_votes, config.max_votes]);
    }
  }, [config, form]);

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
