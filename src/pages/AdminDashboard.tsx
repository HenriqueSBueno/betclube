
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddSiteForm } from "@/components/admin/add-site-form";
import { AddCategoryForm } from "@/components/admin/add-category-form";
import { GenerateRankingsForm } from "@/components/admin/generate-rankings-form";
import { useAuth } from "@/lib/auth";
import { RankingCategory, BettingSite, DailyRanking } from "@/types";
import { mockDb } from "@/lib/mockDb";

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [categories, setCategories] = useState<RankingCategory[]>([]);
  const [sites, setSites] = useState<BettingSite[]>([]);
  const [rankings, setRankings] = useState<DailyRanking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Load data from mock database
  const loadData = () => {
    setCategories(mockDb.rankingCategories.getAll());
    setSites(mockDb.bettingSites.getAll());
    setRankings(mockDb.dailyRankings.getAll());
    setDataLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      loadData();
    }
  }, [isAuthenticated, user]);

  // Show loading state if auth is still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect non-admin users
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage betting sites, categories, and generate daily rankings.
          </p>
        </div>
        
        <Tabs defaultValue="sites" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sites">Betting Sites</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sites">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Betting Site</CardTitle>
                  <CardDescription>
                    Add a new betting site to the database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddSiteForm categories={categories} onSuccess={loadData} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Existing Sites ({sites.length})</CardTitle>
                  <CardDescription>
                    All betting sites in the database
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  {dataLoading ? (
                    <div className="text-center py-4">Loading sites...</div>
                  ) : (
                    <ul className="space-y-3">
                      {sites.map((site) => (
                        <li key={site.id} className="border-b pb-3">
                          <div className="font-medium">{site.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {site.url}
                          </div>
                          <div className="text-xs mt-1">
                            Categories: {site.category.join(", ")}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Category</CardTitle>
                  <CardDescription>
                    Create a new ranking category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddCategoryForm onSuccess={loadData} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Existing Categories ({categories.length})</CardTitle>
                  <CardDescription>
                    All ranking categories in the database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="text-center py-4">Loading categories...</div>
                  ) : (
                    <ul className="space-y-3">
                      {categories.map((category) => (
                        <li key={category.id} className="border-b pb-3">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {category.description}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="rankings">
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
                    onSuccess={loadData} 
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
                  {dataLoading ? (
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
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
