
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddSiteForm } from "@/components/admin/add-site-form";
import { EditSiteForm } from "@/components/admin/edit-site-form";
import { CsvImportExport } from "@/components/admin/csv-import-export";
import { mockDb } from "@/lib/mockDb";
import { BettingSite, RankingCategory } from "@/types";
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

  // Load sites data
  useState(() => {
    setSites(mockDb.bettingSites.getAll());
    setIsLoading(false);
  });

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

  const deleteSite = (siteId: string) => {
    try {
      const deletedSite = mockDb.bettingSites.delete(siteId);
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
  
  const handleDataChange = () => {
    setSites(mockDb.bettingSites.getAll());
    onDataChange();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
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
          {isLoading ? (
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
                  <TableHead>Commission</TableHead>
                  <TableHead>LTV</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
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
                      <div className="font-medium">
                        {site.commission ? `${site.commission}%` : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {site.ltv ? `$${site.ltv.toFixed(2)}` : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
