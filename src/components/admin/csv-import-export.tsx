
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, AlertCircle } from "lucide-react";
import { mockDb } from "@/lib/mockDb";
import { useAuth } from "@/lib/auth";

interface CsvImportExportProps {
  onDataChange: () => void;
}

export function CsvImportExport({ onDataChange }: CsvImportExportProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportCsv = () => {
    try {
      const csvContent = mockDb.bettingSites.exportToCsv();
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and click it
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `betting-sites-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export complete",
        description: "All betting sites were exported successfully."
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "An error occurred while exporting the data."
      });
    }
  };

  const handleImportCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsImporting(true);
    setImportErrors([]);

    try {
      const text = await file.text();
      const result = mockDb.bettingSites.importFromCsv(text, user.id);
      
      if (result.errors.length > 0) {
        setImportErrors(result.errors);
      }
      
      toast({
        title: "Import complete",
        description: `Added ${result.added} new sites, updated ${result.updated} existing sites.${
          result.errors.length > 0 ? ` ${result.errors.length} errors occurred.` : ''
        }`
      });
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component that data has changed
      onDataChange();
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "An error occurred while importing the data."
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import/Export Sites</CardTitle>
        <CardDescription>
          Import sites from CSV or export your current sites
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportCsv}
          >
            <Download className="h-4 w-4" />
            Export Sites as CSV
          </Button>
          
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCsv}
              disabled={isImporting}
              className="hidden"
              id="csv-import"
            />
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Importing..." : "Import Sites from CSV"}
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>CSV format must include headers: name, url, description, categories (separated by |)</p>
          <p>Optional headers: commission, ltv</p>
        </div>
        
        {importErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-bold mb-1">Import errors:</div>
              <ul className="list-disc pl-5">
                {importErrors.slice(0, 5).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
                {importErrors.length > 5 && (
                  <li>...and {importErrors.length - 5} more errors</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
