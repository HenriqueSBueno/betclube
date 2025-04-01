
import { useState, useEffect } from "react";
import { 
  Form,
  FormControl,
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
import { BettingSite, RankingCategory } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  url: z.string().url("Please enter a valid URL."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categories: z.array(z.string()).nonempty("Select at least one category."),
  commission: z.number().min(0).max(100).optional(),
  ltv: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditSiteFormProps {
  site: BettingSite;
  categories: RankingCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditSiteForm({ site, categories, isOpen, onClose, onSuccess }: EditSiteFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: site.name,
      url: site.url,
      description: site.description,
      categories: site.category,
      commission: site.commission || 0,
      ltv: site.ltv || 0,
    }
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: site.name,
        url: site.url,
        description: site.description,
        categories: site.category,
        commission: site.commission || 0,
        ltv: site.ltv || 0,
      });
    }
  }, [isOpen, site, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const updatedSite = mockDb.bettingSites.update(site.id, {
        name: values.name,
        url: values.url,
        description: values.description,
        category: values.categories,
        commission: values.commission,
        ltv: values.ltv
      });
      
      toast({
        title: "Site updated",
        description: `${values.name} has been updated successfully.`
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update site:", error);
      toast({
        variant: "destructive",
        title: "Failed to update site",
        description: "An error occurred while updating the site."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Site: {site.name}</DialogTitle>
        </DialogHeader>
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
            
            {/* Campos apenas para admins */}
            <div className="grid grid-cols-2 gap-4">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
