
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Edit, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddSiteForm } from "@/components/admin/add-site-form";
import { EditSiteForm } from "@/components/admin/edit-site-form";
import { CsvImportExport } from "@/components/admin/csv-import-export";
import { mockDb } from "@/lib/mockDb";
import { BettingSite, RankingCategory } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface SiteManagementProps {
  categories: RankingCategory[];
  onDataChange: () => void;
}

export function SiteManagement({ categories, onDataChange }: SiteManagementProps) {
  const [sites, setSites] = useState<BettingSite[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [editingSite, setEditingSite] = useState<BettingSite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load sites data
  useEffect(() => {
    const loadSites = async () => {
      setIsLoading(true);
      try {
        console.log("[SiteManagement] Loading betting sites");
        const sitesList = await mockDb.bettingSites.getAll();
        console.log("[SiteManagement] Sites loaded:", sitesList);
        setSites(sitesList);
      } catch (error) {
        console.error("[SiteManagement] Error loading sites:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load betting sites."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSites();
  }, [toast]);

  const toggleSiteSelection = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const toggleAllSites = () => {
    if (selectedSites.length === sites.length) {
      setSelectedSites([]);
    } else {
      setSelectedSites(sites.map(site => site.id));
    }
  };

  const deleteSite = async (siteId: string) => {
    try {
      const deletedSite = await mockDb.bettingSites.delete(siteId);
      if (deletedSite) {
        setSites(prevSites => prevSites.filter(site => site.id !== siteId));
        toast({
          title: "Site deleted",
          description: `${deletedSite.name} has been successfully removed.`
        });
        onDataChange();
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

  const deleteBulkSites = async () => {
    let successCount = 0;
    let failCount = 0;
    
    for (const siteId of selectedSites) {
      try {
        const deleted = await mockDb.bettingSites.delete(siteId);
        if (deleted) successCount++;
        else failCount++;
      } catch (error) {
        failCount++;
        console.error(`Error deleting site ${siteId}:`, error);
      }
    }
    
    setSites(prevSites => prevSites.filter(site => !selectedSites.includes(site.id)));
    setSelectedSites([]);
    onDataChange();
    
    toast({
      title: `${successCount} sites deleted`,
      description: failCount > 0 
        ? `${failCount} sites could not be deleted.` 
        : "All selected sites were successfully removed."
    });
  };

  const handleEditSite = (site: BettingSite) => {
    setEditingSite(site);
  };
  
  const handleDataChange = async () => {
    console.log("[SiteManagement] handleDataChange called - refreshing data");
    try {
      const updatedSites = await mockDb.bettingSites.getAll();
      console.log("[SiteManagement] Updated sites data:", updatedSites);
      setSites(updatedSites);
      onDataChange();
    } catch (error) {
      console.error("[SiteManagement] Error refreshing sites data:", error);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Add New Betting Site</CardTitle>
            <CardDescription>
              Add a new betting site to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddSiteForm categories={categories} onSuccess={handleDataChange} />
          </CardContent>
        </Card>
        
        <div className="mt-6">
          <CsvImportExport onDataChange={handleDataChange} />
        </div>
      </div>
      
      <Card className="overflow-hidden">
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
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-4">Loading sites...</div>
          ) : (
            <ScrollArea className="h-[400px] w-full rounded-md">
              <div className="w-full">
                {isMobile ? (
                  // Mobile layout: card-based view
                  <div className="space-y-2 p-4">
                    {sites.map((site) => (
                      <div key={site.id} className="border rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={selectedSites.includes(site.id)}
                              onCheckedChange={() => toggleSiteSelection(site.id)}
                            />
                            <div className="font-medium">{site.name}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditSite(site)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-1">
                          <ExternalLink className="h-3 w-3" />
                          <a href={site.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                            {site.url}
                          </a>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Categories:</span>
                            <div className="text-xs">{site.category.join(", ")}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Commission:</span>
                            <div>{site.commission ? `${site.commission}%` : "-"}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">LTV:</span>
                            <div>{site.ltv ? `$${site.ltv.toFixed(2)}` : "-"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Desktop layout: table view with improved spacing
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox 
                            checked={sites.length > 0 && selectedSites.length === sites.length}
                            onCheckedChange={toggleAllSites}
                          />
                        </TableHead>
                        <TableHead className="min-w-[200px]">Site</TableHead>
                        <TableHead className="min-w-[150px]">Categories</TableHead>
                        <TableHead className="min-w-[100px]">Commission</TableHead>
                        <TableHead className="min-w-[100px]">LTV</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sites.map((site) => (
                        <TableRow key={site.id} className="group">
                          <TableCell className="p-2">
                            <Checkbox 
                              checked={selectedSites.includes(site.id)}
                              onCheckedChange={() => toggleSiteSelection(site.id)}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="font-medium">{site.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-1 w-full max-w-[250px]">
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              <a 
                                href={site.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="truncate hover:underline"
                                title={site.url}
                              >
                                {site.url}
                              </a>
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="text-xs line-clamp-2">
                              {site.category.join(", ")}
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="font-medium">
                              {site.commission ? `${site.commission}%` : "-"}
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="font-medium">
                              {site.ltv ? `$${site.ltv.toFixed(2)}` : "-"}
                            </div>
                          </TableCell>
                          <TableCell className="p-2 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditSite(site)}
                                className="opacity-70 group-hover:opacity-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="opacity-70 group-hover:opacity-100"
                                  >
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      {editingSite && (
        <EditSiteForm
          site={editingSite}
          categories={categories}
          isOpen={!!editingSite}
          onClose={() => setEditingSite(null)}
          onSuccess={handleDataChange}
        />
      )}
    </div>
  );
}
