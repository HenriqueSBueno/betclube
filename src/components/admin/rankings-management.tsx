
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateRankingsForm } from "@/components/admin/generate-rankings-form";
import { mockDb } from "@/lib/mockDb";
import { DailyRanking, RankingCategory } from "@/types";

interface RankingsManagementProps {
  categories: RankingCategory[];
  onDataChange: () => void;
}

export function RankingsManagement({ categories, onDataChange }: RankingsManagementProps) {
  const [rankings, setRankings] = useState<DailyRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setRankings(mockDb.dailyRankings.getAll());
    setIsLoading(false);
  }, []);

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
            onSuccess={onDataChange}
          />
        </CardContent>
      </Card>
      
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
              {rankings.map((ranking) => (
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
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
