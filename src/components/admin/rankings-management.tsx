
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateRankingsForm } from "@/components/admin/generate-rankings-form";
import { mockDb } from "@/lib/mockDb";
import { DailyRanking, RankingCategory } from "@/types";
import { RankingConfiguration } from "@/lib/mockDb/ranking-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RankingsManagementProps {
  categories: RankingCategory[];
  onDataChange: () => void;
}

export function RankingsManagement({ categories, onDataChange }: RankingsManagementProps) {
  const [rankings, setRankings] = useState<DailyRanking[]>([]);
  const [configs, setConfigs] = useState<RankingConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRankings(mockDb.dailyRankings.getAll());
    
    // Load configurations for all categories
    const categoryConfigs = categories.map(category => 
      mockDb.dailyRankings.getConfiguration(category.id)
    );
    setConfigs(categoryConfigs);
    
    setIsLoading(false);
  };

  // Helper to find configuration for a category
  const getConfigForCategory = (categoryId: string) => {
    return configs.find(config => config.categoryId === categoryId);
  };

  // Simulate midnight ranking regeneration for demo purposes
  const handleSimulateMidnightRegeneration = () => {
    setIsLoading(true);
    
    try {
      const updatedRankings = mockDb.dailyRankings.generateDailyBatch();
      
      setRankings([...mockDb.dailyRankings.getAll()]);
      
      // Reset votes for all rankings
      updatedRankings.forEach(ranking => {
        if (ranking) {
          // Here we would reset votes for this ranking in a real app
        }
      });
      
      onDataChange();
    } catch (error) {
      console.error("Failed to simulate midnight regeneration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Daily Rankings</CardTitle>
          <CardDescription>
            Create new random rankings for a category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateRankingsForm 
            categories={categories} 
            onSuccess={() => {
              loadData();
              onDataChange();
            }}
          />
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Rankings</CardTitle>
            <CardDescription>
              Active daily rankings by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading rankings...</div>
            ) : (
              <ul className="space-y-3">
                {rankings.map((ranking) => {
                  const config = getConfigForCategory(ranking.categoryId);
                  
                  return (
                    <li key={ranking.id} className="border-b pb-3">
                      <div className="font-medium">
                        {ranking.categoryName}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Generated: </span>
                        {new Date(ranking.generationDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Sites: </span>
                        {ranking.sites.length}
                        {config && ` (configured for ${config.siteCount})`}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Vote Range: </span>
                        {config ? `${config.voteRange.minVotes} - ${config.voteRange.maxVotes}` : "Default"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ranking Configurations</CardTitle>
            <CardDescription>
              Current settings for midnight regeneration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Sites</TableHead>
                  <TableHead>Vote Range</TableHead>
                  <TableHead>Last Modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => {
                  const category = categories.find(c => c.id === config.categoryId);
                  return (
                    <TableRow key={config.categoryId}>
                      <TableCell>{category?.name || "Unknown"}</TableCell>
                      <TableCell>{config.siteCount}</TableCell>
                      <TableCell>{config.voteRange.minVotes} - {config.voteRange.maxVotes}</TableCell>
                      <TableCell>{new Date(config.lastModified).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={handleSimulateMidnightRegeneration}
                disabled={isLoading}
              >
                Simulate Midnight Regeneration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Import Button for the simulation feature
import { Button } from "@/components/ui/button";
