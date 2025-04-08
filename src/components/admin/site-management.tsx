
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Trash, 
  Edit, 
  ExternalLink, 
  Tag,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddSiteForm } from "@/components/admin/add-site-form";
import { EditSiteForm } from "@/components/admin/edit-site-form";
import { CsvImportExport } from "@/components/admin/csv-import-export";
import { mockDb } from "@/lib/mockDb";
import { BettingSite, RankingCategory, SiteLabel } from "@/types";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { SiteLabelService } from "@/services/site-label-service";
import { BettingSiteService } from "@/services/betting-site-service";

interface SiteManagementProps {
  categories: RankingCategory[];
  onDataChange: () => void;
}

export function SiteManagement({ categories, onDataChange }: SiteManagementProps) {
  const [sites, setSites] = useState<BettingSite[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [editingSite, setEditingSite] = useState<BettingSite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [labels, setLabels] = useState<SiteLabel[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [editingSiteLabels, setEditingSiteLabels] = useState<string[]>([]);
  const [managingLabelsForSite, setManagingLabelsForSite] = useState<BettingSite | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load sites data
  useEffect(() => {
    const loadSites = async () => {
      setIsLoading(true);
      try {
        console.log("[SiteManagement] Loading betting sites");
        // Use the BettingSiteService instead of mockDb
        const sitesList = await BettingSiteService.getAll();
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

  // Load labels
  useEffect(() => {
    const loadLabels = async () => {
      try {
        const labelsList = await SiteLabelService.getAll();
        setLabels(labelsList);
      } catch (error) {
        console.error("[SiteManagement] Error loading labels:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load site labels."
        });
      }
    };

    loadLabels();
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
      // Use BettingSiteService instead of mockDb
      const success = await BettingSiteService.delete(siteId);
      if (success) {
        setSites(prevSites => prevSites.filter(site => site.id !== siteId));
        toast({
          title: "Site deleted",
          description: "The site has been successfully removed."
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
        const deleted = await BettingSiteService.delete(siteId);
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
      const updatedSites = await BettingSiteService.getAll();
      console.log("[SiteManagement] Updated sites data:", updatedSites);
      setSites(updatedSites);
      onDataChange();
    } catch (error) {
      console.error("[SiteManagement] Error refreshing sites data:", error);
    }
  };

  const openLabelsManager = (site: BettingSite) => {
    setManagingLabelsForSite(site);
    setEditingSiteLabels(site.siteLabels || []);
  };

  const handleLabelSelect = (labelName: string) => {
    setEditingSiteLabels(prev => 
      prev.includes(labelName)
        ? prev.filter(name => name !== labelName)
        : [...prev, labelName]
    );
  };

  const saveLabels = async () => {
    if (!managingLabelsForSite) return;
    
    try {
      await BettingSiteService.update(managingLabelsForSite.id, {
        siteLabels: editingSiteLabels
      });
      
      setSites(prev => prev.map(site => 
        site.id === managingLabelsForSite.id 
          ? { ...site, siteLabels: editingSiteLabels } 
          : site
      ));
      
      toast({
        title: "Labels updated",
        description: "Labels have been successfully updated for this site."
      });
      
      setManagingLabelsForSite(null);
    } catch (error) {
      console.error("Error updating site labels:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update site labels."
      });
    }
  };

  const getLabelColor = (labelName: string) => {
    const label = labels.find(l => l.name === labelName);
    return label?.color || "#888888";
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
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openLabelsManager(site)}
                                >
                                  <Tag className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-auto">
                                <div className="space-y-2">
                                  <div className="font-medium">Manage Labels</div>
                                  <div className="flex flex-wrap gap-2 max-w-[250px]">
                                    {site.siteLabels && site.siteLabels.length > 0 ? (
                                      site.siteLabels.map(labelName => (
                                        <Badge 
                                          key={labelName} 
                                          style={{backgroundColor: getLabelColor(labelName)}}
                                        >
                                          {labelName}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-muted-foreground">No labels assigned</span>
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
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
                        
                        {site.siteLabels && site.siteLabels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {site.siteLabels.map(labelName => (
                              <Badge 
                                key={labelName} 
                                variant="outline" 
                                className="text-xs"
                                style={{
                                  borderColor: getLabelColor(labelName),
                                  color: getLabelColor(labelName)
                                }}
                              >
                                {labelName}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
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
                        <TableHead className="min-w-[250px]">Site</TableHead>
                        <TableHead className="min-w-[150px]">Categories</TableHead>
                        <TableHead className="min-w-[100px]">Commission</TableHead>
                        <TableHead className="min-w-[100px]">LTV</TableHead>
                        <TableHead className="w-[130px] text-right">Actions</TableHead>
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
                            <div className="font-medium flex items-center gap-2">
                              {site.name}
                              {site.siteLabels && site.siteLabels.length > 0 && (
                                <div className="flex flex-wrap gap-1 ml-2">
                                  {site.siteLabels.map(labelName => (
                                    <Badge 
                                      key={labelName} 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{
                                        borderColor: getLabelColor(labelName),
                                        color: getLabelColor(labelName)
                                      }}
                                    >
                                      {labelName}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
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
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 opacity-70 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLabelsManager(site);
                                    }}
                                  >
                                    <Tag className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-auto">
                                  <div className="space-y-2">
                                    <div className="font-medium">Manage Labels</div>
                                    <div className="flex flex-wrap gap-2 max-w-[250px]">
                                      {site.siteLabels && site.siteLabels.length > 0 ? (
                                        site.siteLabels.map(labelName => (
                                          <Badge 
                                            key={labelName} 
                                            style={{backgroundColor: getLabelColor(labelName)}}
                                          >
                                            {labelName}
                                          </Badge>
                                        ))
                                      ) : (
                                        <span className="text-sm text-muted-foreground">No labels assigned</span>
                                      )}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
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
      
      {/* Labels Manager Dialog */}
      {managingLabelsForSite && (
        <AlertDialog open={!!managingLabelsForSite} onOpenChange={(open) => !open && setManagingLabelsForSite(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Manage Labels for {managingLabelsForSite.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Select labels to apply to this site.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Applied Labels:</div>
                  <div className="flex flex-wrap gap-2 min-h-10">
                    {editingSiteLabels.length > 0 ? (
                      editingSiteLabels.map(labelName => (
                        <Badge 
                          key={labelName} 
                          className="flex items-center gap-1"
                          style={{backgroundColor: getLabelColor(labelName)}}
                        >
                          {labelName}
                          <button 
                            onClick={() => setEditingSiteLabels(prev => prev.filter(l => l !== labelName))}
                            className="rounded-full hover:bg-black/20 flex items-center justify-center h-4 w-4"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No labels selected</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Available Labels:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {labels.length > 0 ? (
                      labels.map(label => (
                        <div 
                          key={label.id} 
                          className="flex items-center space-x-2 border rounded p-2 cursor-pointer hover:bg-accent"
                          onClick={() => handleLabelSelect(label.name)}
                        >
                          <Checkbox 
                            checked={editingSiteLabels.includes(label.name)}
                            onCheckedChange={() => handleLabelSelect(label.name)}
                          />
                          <span 
                            className="h-3 w-3 rounded-full" 
                            style={{backgroundColor: label.color}}
                          />
                          <span>{label.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground col-span-2">
                        No labels available. Create labels in the Labels section.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={saveLabels}>Save Labels</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
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
