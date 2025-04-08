
import { useState, useEffect } from "react";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { mockDb } from "@/lib/mockDb";
import { useAuth } from "@/lib/auth";
import { RankingCategory, SiteLabel } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteLabelService } from "@/services/site-label-service";
import { BettingSiteService } from "@/services/betting-site-service";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  url: z.string().url("Please enter a valid URL."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categories: z.array(z.string()).nonempty("Select at least one category."),
  commission: z.number().min(0).max(100).optional(),
  ltv: z.number().min(0).optional(),
  siteLabels: z.array(z.string()).optional()
});

type FormValues = z.infer<typeof formSchema>;

interface AddSiteFormProps {
  categories: RankingCategory[];
  onSuccess: () => void;
}

export function AddSiteForm({ categories, onSuccess }: AddSiteFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<SiteLabel[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      categories: [],
      commission: 0,
      ltv: 0,
      siteLabels: []
    }
  });

  useEffect(() => {
    // Load available labels
    const loadLabels = async () => {
      try {
        const labels = await SiteLabelService.getAll();
        setAvailableLabels(labels);
      } catch (error) {
        console.error("Error loading labels:", error);
      }
    };
    
    loadLabels();
  }, []);

  const onSubmit = async (values: FormValues) => {
    console.log("[AddSiteForm] Form submission values:", values);
    console.log("[AddSiteForm] Current user:", user);
    
    if (!user) {
      console.error("[AddSiteForm] No user found, cannot submit form");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("[AddSiteForm] Creating site with data:", {
        name: values.name,
        url: values.url,
        description: values.description,
        category: values.categories,
        adminOwnerId: user.id,
        commission: values.commission,
        ltv: values.ltv,
        siteLabels: values.siteLabels
      });
      
      // Use BettingSiteService instead of mockDb
      const newSite = await BettingSiteService.create({
        name: values.name,
        url: values.url,
        description: values.description,
        category: values.categories,
        registrationDate: new Date(),
        adminOwnerId: user.id,
        logoUrl: `https://placehold.co/100x50/FFD760/151515?text=${encodeURIComponent(values.name)}`,
        commission: values.commission,
        ltv: values.ltv,
        siteLabels: values.siteLabels
      });
      
      console.log("[AddSiteForm] Site created successfully:", newSite);
      
      toast({
        title: "Site added",
        description: `${values.name} has been added successfully.`
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("[AddSiteForm] Failed to add site:", error);
      toast({
        variant: "destructive",
        title: "Failed to add site",
        description: "An error occurred while adding the site."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLabelSelect = (labelName: string) => {
    const currentLabels = form.getValues().siteLabels || [];
    
    if (currentLabels.includes(labelName)) {
      form.setValue(
        'siteLabels', 
        currentLabels.filter(l => l !== labelName)
      );
    } else {
      form.setValue('siteLabels', [...currentLabels, labelName]);
    }
  };

  const getLabelColor = (labelName: string) => {
    const label = availableLabels.find(l => l.name === labelName);
    return label?.color || "#888888";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="https://" 
                  disabled={isSubmitting} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  rows={3}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categories"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Categories</FormLabel>
                <FormDescription>
                  Select all categories that apply to this betting site.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <FormField
                    key={category.id}
                    control={form.control}
                    name="categories"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={category.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(category.name)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, category.name])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== category.name
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {category.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Labels selection */}
        <FormField
          control={form.control}
          name="siteLabels"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Labels</FormLabel>
                <FormDescription>
                  Select labels to apply to this site.
                </FormDescription>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Applied Labels:</div>
                  <div className="flex flex-wrap gap-2 min-h-10">
                    {field.value && field.value.length > 0 ? (
                      field.value.map(labelName => (
                        <Badge 
                          key={labelName} 
                          className="flex items-center gap-1"
                          style={{backgroundColor: getLabelColor(labelName)}}
                        >
                          {labelName}
                          <button 
                            type="button"
                            onClick={() => {
                              field.onChange(field.value?.filter(l => l !== labelName));
                            }}
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
                  <div className="text-sm font-medium">Available Labels:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {availableLabels.length > 0 ? (
                      availableLabels.map(label => (
                        <div 
                          key={label.id} 
                          className="flex items-center space-x-2 border rounded p-2 cursor-pointer hover:bg-accent"
                          onClick={() => handleLabelSelect(label.name)}
                        >
                          <Checkbox 
                            checked={field.value?.includes(label.name)}
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
              
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Campos de segurança apenas para admins */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <FormField
            control={form.control}
            name="commission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.01"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                    value={field.value || 0}
                    disabled={isSubmitting} 
                  />
                </FormControl>
                <FormDescription>
                  Admin-only field for tracking affiliate commission.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ltv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LTV (Lifetime Value)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                    value={field.value || 0}
                    disabled={isSubmitting} 
                  />
                </FormControl>
                <FormDescription>
                  Admin-only field for customer lifetime value.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Site"}
        </Button>
      </form>
    </Form>
  );
}
