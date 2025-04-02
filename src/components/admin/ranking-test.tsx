
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RankingCategory } from "@/types";

interface RankingTestProps {
  categories: RankingCategory[];
}

export function RankingTest({ categories }: RankingTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || "");
  const [siteCount, setSiteCount] = useState<string>("10");
  const [minVotes, setMinVotes] = useState<string>("0");
  const [maxVotes, setMaxVotes] = useState<string>("100");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().substring(11, 23)}: ${message}`]);
  };

  const testDirectFunction = async () => {
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsLoading(true);
    setResult(null);
    addLog("Starting direct function test...");

    try {
      addLog(`Calling generate_daily_ranking with category_id=${selectedCategoryId}, site_count=${siteCount}, min_votes=${minVotes}, max_votes=${maxVotes}`);
      
      // Call the database function directly
      const { data, error } = await supabase.rpc('generate_daily_ranking', {
        category_id: selectedCategoryId,
        site_count: parseInt(siteCount, 10),
        min_votes: parseInt(minVotes, 10),
        max_votes: parseInt(maxVotes, 10)
      });
      
      if (error) {
        addLog(`Error from direct function call: ${error.message}`);
        toast.error(`Function error: ${error.message}`);
        setResult(JSON.stringify({ error }, null, 2));
      } else {
        addLog(`Direct function call successful. Result: ${data}`);
        toast.success("Ranking generated successfully!");
        setResult(JSON.stringify({ data }, null, 2));
        
        // Try to fetch the generated ranking
        const rankingId = data;
        addLog(`Trying to fetch the generated ranking with ID: ${rankingId}`);
        
        const { data: rankingData, error: rankingError } = await supabase
          .from('daily_rankings')
          .select('*, ranked_sites(*)')
          .eq('id', rankingId)
          .single();
          
        if (rankingError) {
          addLog(`Error fetching ranking: ${rankingError.message}`);
        } else {
          addLog(`Successfully fetched ranking with ${rankingData.ranked_sites.length} sites`);
          setResult(JSON.stringify({ function_result: data, ranking: rankingData }, null, 2));
        }
      }
    } catch (error) {
      addLog(`Exception during test: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Test error: ${error instanceof Error ? error.message : String(error)}`);
      setResult(`Exception: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEdgeFunction = async () => {
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsLoading(true);
    setResult(null);
    addLog("Starting edge function test...");

    try {
      addLog(`Calling generate-ranking API with category_id=${selectedCategoryId}, site_count=${siteCount}, min_votes=${minVotes}, max_votes=${maxVotes}`);
      
      // Call the API endpoint
      const response = await fetch('/api/generate-ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: selectedCategoryId,
          site_count: parseInt(siteCount, 10),
          min_votes: parseInt(minVotes, 10),
          max_votes: parseInt(maxVotes, 10)
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        addLog(`API error: ${responseData.message || response.statusText}`);
        toast.error(`API error: ${responseData.message || response.statusText}`);
      } else {
        addLog(`API call successful. Result: ${JSON.stringify(responseData)}`);
        toast.success("API call successful!");
      }
      
      setResult(JSON.stringify(responseData, null, 2));
    } catch (error) {
      addLog(`Exception during test: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Test error: ${error instanceof Error ? error.message : String(error)}`);
      setResult(`Exception: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSupabaseFunction = async () => {
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsLoading(true);
    setResult(null);
    addLog("Starting Supabase function test...");

    try {
      addLog(`Invoking generate_daily_ranking with category_id=${selectedCategoryId}, site_count=${siteCount}, min_votes=${minVotes}, max_votes=${maxVotes}`);
      
      // Use Supabase Functions API
      const { data, error } = await supabase.functions.invoke('generate_daily_ranking', {
        body: { 
          category_id: selectedCategoryId,
          site_count: parseInt(siteCount, 10),
          min_votes: parseInt(minVotes, 10),
          max_votes: parseInt(maxVotes, 10)
        }
      });
      
      if (error) {
        addLog(`Edge function error: ${error.message}`);
        toast.error(`Edge function error: ${error.message}`);
      } else {
        addLog(`Edge function call successful. Result: ${JSON.stringify(data)}`);
        toast.success("Edge function call successful!");
      }
      
      setResult(JSON.stringify({ data, error }, null, 2));
    } catch (error) {
      addLog(`Exception during test: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Test error: ${error instanceof Error ? error.message : String(error)}`);
      setResult(`Exception: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Ranking Generation Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Site Count</label>
                <Input
                  type="number"
                  value={siteCount}
                  onChange={(e) => setSiteCount(e.target.value)}
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Votes</label>
                <Input
                  type="number"
                  value={minVotes}
                  onChange={(e) => setMinVotes(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Votes</label>
                <Input
                  type="number"
                  value={maxVotes}
                  onChange={(e) => setMaxVotes(e.target.value)}
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testDirectFunction} disabled={isLoading}>
              {isLoading ? "Testing..." : "Test Database Function"}
            </Button>
            <Button onClick={testEdgeFunction} variant="secondary" disabled={isLoading}>
              {isLoading ? "Testing..." : "Test API Endpoint"}
            </Button>
            <Button onClick={testSupabaseFunction} variant="outline" disabled={isLoading}>
              {isLoading ? "Testing..." : "Test Edge Function"}
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-md max-h-80 overflow-auto">
            <h4 className="text-sm font-medium mb-2">Logs:</h4>
            {logs.map((log, index) => (
              <div key={index} className="text-xs mb-1 font-mono">{log}</div>
            ))}
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="text-sm font-medium mb-2">Result:</h4>
              <pre className="text-xs overflow-auto max-h-80 font-mono">{result}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
