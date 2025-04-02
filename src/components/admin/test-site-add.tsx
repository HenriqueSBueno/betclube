
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDb } from "@/lib/mockDb";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function TestSiteAdd() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

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
      
      const response = await mockDb.bettingSites.create(testSite);
      
      console.log("[TestSiteAdd] Response from create:", response);
      
      if (response) {
        toast({
          title: "Test site added",
          description: `${response.name} has been added successfully.`
        });
        setResult(JSON.stringify(response, null, 2));
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
        <Button 
          onClick={addTestSite} 
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Test Site"}
        </Button>
        
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
