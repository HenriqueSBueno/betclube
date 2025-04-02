
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, AlertCircle } from "lucide-react";
import { mockDb } from "@/lib/mockDb";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

interface CsvImportExportProps {
  onDataChange: () => void;
}

export function CsvImportExport({ onDataChange }: CsvImportExportProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportCsv = async () => {
    try {
      // Get data from Supabase instead of mockDb
      const { data: sites, error } = await supabase
        .from('betting_sites')
        .select('*');
      
      if (error) throw error;
      
      // Create CSV header
      const headers = ['name', 'url', 'description', 'categories', 'commission', 'ltv'];
      
      // Map sites to CSV rows
      const rows = sites.map(site => [
        site.name,
        site.url,
        site.description.replace(/"/g, '""'), // Escape double quotes
        site.category.join('|'),
        site.commission?.toString() || '',
        site.ltv?.toString() || ''
      ]);
      
      // Combine header and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
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
      
      // Process CSV rows
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Validate headers
      const requiredHeaders = ['name', 'url', 'description', 'categories'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setImportErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
        setIsImporting(false);
        return;
      }
      
      let added = 0;
      let updated = 0;
      const errors: string[] = [];
      
      // Process rows
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue; // Skip empty rows
        
        try {
          const values = rows[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          
          const nameIndex = headers.indexOf('name');
          const urlIndex = headers.indexOf('url');
          const descriptionIndex = headers.indexOf('description');
          const categoriesIndex = headers.indexOf('categories');
          const commissionIndex = headers.indexOf('commission');
          const ltvIndex = headers.indexOf('ltv');
          
          if (values.length < 4) {
            errors.push(`Row ${i}: Not enough values`);
            continue;
          }
          
          const name = values[nameIndex];
          const url = values[urlIndex];
          const description = values[descriptionIndex];
          const categories = values[categoriesIndex].split('|');
          const commission = commissionIndex >= 0 ? parseFloat(values[commissionIndex]) || null : null;
          const ltv = ltvIndex >= 0 ? parseFloat(values[ltvIndex]) || null : null;
          
          // Check if site already exists in Supabase
          const { data: existingSites, error: findError } = await supabase
            .from('betting_sites')
            .select('id')
            .eq('name', name)
            .maybeSingle();
          
          if (findError) throw findError;
          
          if (existingSites) {
            // Update existing site in Supabase
            const { error: updateError } = await supabase
              .from('betting_sites')
              .update({
                url,
                description,
                category: categories,
                commission: isNaN(Number(commission)) ? null : commission,
                ltv: isNaN(Number(ltv)) ? null : ltv
              })
              .eq('id', existingSites.id);
            
            if (updateError) throw updateError;
            updated++;
          } else {
            // Add new site to Supabase
            const { error: insertError } = await supabase
              .from('betting_sites')
              .insert({
                name,
                url,
                description,
                category: categories,
                registration_date: new Date().toISOString(),
                admin_owner_id: user.id,
                logo_url: `https://placehold.co/100x50/FFD760/151515?text=${encodeURIComponent(name)}`,
                commission: commission || null,
                ltv: ltv || null
              });
            
            if (insertError) throw insertError;
            added++;
          }
        } catch (error) {
          console.error(`Row ${i} error:`, error);
          errors.push(`Row ${i}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      setImportErrors(errors);
      
      toast({
        title: "Import complete",
        description: `Added ${added} new sites, updated ${updated} existing sites.${
          errors.length > 0 ? ` ${errors.length} errors occurred.` : ''
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
