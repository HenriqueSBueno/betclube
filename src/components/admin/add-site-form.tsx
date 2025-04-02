
import { useState } from "react";
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
import { RankingCategory } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  url: z.string().url("Please enter a valid URL."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categories: z.array(z.string()).nonempty("Select at least one category."),
  commission: z.number().min(0).max(100).optional(),
  ltv: z.number().min(0).optional(),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      categories: [],
      commission: 0,
      ltv: 0
    }
  });

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
        ltv: values.ltv
      });
      
      const newSite = await mockDb.bettingSites.create({
        name: values.name,
        url: values.url,
        description: values.description,
        category: values.categories,
        registrationDate: new Date(),
        adminOwnerId: user.id,
        logoUrl: `https://placehold.co/100x50/FFD760/151515?text=${encodeURIComponent(values.name)}`,
        commission: values.commission,
        ltv: values.ltv
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
