
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [categories, setCategories] = useState<RankingCategory[]>([]);
  const [sites, setSites] = useState<BettingSite[]>([]);
  const [rankings, setRankings] = useState<DailyRanking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Load data from mock database
  const loadData = () => {
    setCategories(mockDb.rankingCategories.getAll());
    setSites(mockDb.bettingSites.getAll());
    setRankings(mockDb.dailyRankings.getAll());
    setDataLoading(false);
    setSelectedSites([]);
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      loadData();
    }
  }, [isAuthenticated, user]);

  // Handle checkbox selection
  const toggleSiteSelection = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  // Handle bulk selection
  const toggleAllSites = () => {
    if (selectedSites.length === sites.length) {
      setSelectedSites([]);
    } else {
      setSelectedSites(sites.map(site => site.id));
    }
  };

  // Delete a single site
  const deleteSite = (siteId: string) => {
    try {
      const deletedSite = mockDb.bettingSites.delete(siteId);
      if (deletedSite) {
        setSites(prevSites => prevSites.filter(site => site.id !== siteId));
        toast({
          title: "Site deleted",
          description: `${deletedSite.name} has been successfully removed.`
        });
      }
    } catch (error) {
      console.error("Error deleting site:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the site."
      });
    }
  };

  // Delete multiple sites
  const deleteBulkSites = () => {
    let successCount = 0;
    let failCount = 0;
    
    selectedSites.forEach(siteId => {
      try {
        const deleted = mockDb.bettingSites.delete(siteId);
        if (deleted) successCount++;
        else failCount++;
      } catch (error) {
        failCount++;
        console.error(`Error deleting site ${siteId}:`, error);
      }
    });
    
    setSites(prevSites => prevSites.filter(site => !selectedSites.includes(site.id)));
    setSelectedSites([]);
    
    toast({
      title: `${successCount} sites deleted`,
      description: failCount > 0 
        ? `${failCount} sites could not be deleted.` 
        : "All selected sites were successfully removed."
    });
  };

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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Existing Sites ({sites.length})</CardTitle>
                    <CardDescription>
                      All betting sites in the database
                    </CardDescription>
                  </div>
                  {selectedSites.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete Selected ({selectedSites.length})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete selected sites?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {selectedSites.length} selected sites. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={deleteBulkSites}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  {dataLoading ? (
                    <div className="text-center py-4">Loading sites...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox 
                              checked={sites.length > 0 && selectedSites.length === sites.length}
                              onCheckedChange={toggleAllSites}
                            />
                          </TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead>Categories</TableHead>
                          <TableHead className="w-12">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sites.map((site) => (
                          <TableRow key={site.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedSites.includes(site.id)}
                                onCheckedChange={() => toggleSiteSelection(site.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{site.name}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {site.url}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {site.category.join(", ")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {site.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the site. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteSite(site.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
