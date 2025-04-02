
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDb } from "@/lib/mockDb";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function TestSiteAdd() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Test Supabase connection function
  const testSupabaseConnection = async () => {
    try {
      console.log("[TestSupabase] Testing Supabase connection...");
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id');
      
      if (error) {
        console.error("[TestSupabase] Connection error:", error);
        setResult(`Connection error: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log("[TestSupabase] Connection successful:", data);
        setResult(`Connection successful: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error("[TestSupabase] Exception while testing connection:", error);
      setResult(`Exception: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const addTestSite = async () => {
    if (!user) {
      console.error("[TestSiteAdd] No user found, cannot add test site");
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add a site."
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    const testSite = {
      name: "Test Site " + new Date().toISOString(),
      url: "https://www.testsite.com",
      description: "This is a test site added via direct API call",
      category: ["Test", "Sports"],
      registrationDate: new Date(),
      adminOwnerId: user.id,
      logoUrl: `https://placehold.co/100x50/FFD760/151515?text=TestSite`,
      commission: 5.5,
      ltv: 100
    };
    
    try {
      console.log("[TestSiteAdd] Sending test site data:", testSite);
      console.log("[TestSiteAdd] User ID:", user.id);
      
      // Try both mockDb and Supabase approaches
      
      // 1. First via mockDb (original approach)
      const mockDbResponse = await mockDb.bettingSites.create(testSite);
      console.log("[TestSiteAdd] Response from mockDb create:", mockDbResponse);
      
      // 2. Then via direct Supabase insert
      const supabaseData = {
        name: testSite.name,
        url: testSite.url,
        description: testSite.description,
        category: testSite.category,
        logo_url: testSite.logoUrl,
        registration_date: testSite.registrationDate.toISOString(),
        admin_owner_id: testSite.adminOwnerId,
        commission: testSite.commission,
        ltv: testSite.ltv
      };
      
      console.log("[TestSiteAdd] Data prepared for Supabase:", supabaseData);
      
      const { data, error } = await supabase
        .from('betting_sites')
        .insert(supabaseData)
        .select()
        .single();
        
      console.log("[TestSiteAdd] Supabase direct response:", { data, error });
      
      if (error) {
        console.error("[TestSiteAdd] Supabase error:", error);
      }
      
      if (mockDbResponse) {
        toast({
          title: "Test site added",
          description: `${mockDbResponse.name} has been added successfully.${
            error ? " (Note: Supabase insert failed)" : " (Added to both mockDb and Supabase)"
          }`
        });
        
        setResult(`mockDb Response: ${JSON.stringify(mockDbResponse, null, 2)}
        
Supabase Direct: ${JSON.stringify({ data, error }, null, 2)}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add test site, response was null."
        });
        setResult("Error: Response was null");
      }
    } catch (error) {
      console.error("[TestSiteAdd] Error adding test site:", error);
      console.error("[TestSiteAdd] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add test site: ${error instanceof Error ? error.message : String(error)}`
      });
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Add Test Site Directly</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={addTestSite} 
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Test Site"}
          </Button>
          
          <Button
            onClick={testSupabaseConnection}
            variant="outline"
          >
            Test Supabase Connection
          </Button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">Result:</h4>
            <pre className="text-xs overflow-auto max-h-80">{result}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
