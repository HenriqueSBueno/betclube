
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash, ChevronUp, ChevronDown } from "lucide-react";
import { RankingCategory } from "@/types";
import { CategoryService } from "@/services/category-service";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CategoryListProps {
  categories: RankingCategory[];
  onDataChange: () => void;
}

export function CategoryList({ categories, onDataChange }: CategoryListProps) {
  const [editCategory, setEditCategory] = useState<RankingCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<RankingCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Setup edit form when a category is selected for editing
  useEffect(() => {
    if (editCategory) {
      setEditName(editCategory.name);
      setEditDescription(editCategory.description);
    } else {
      setEditName("");
      setEditDescription("");
    }
  }, [editCategory]);

  const startEdit = (category: RankingCategory) => {
    setEditCategory(category);
  };

  const cancelEdit = () => {
    setEditCategory(null);
  };

  const saveEdit = async () => {
    if (!editCategory) return;
    
    setIsLoading(true);
    try {
      const updated = await CategoryService.update(editCategory.id, {
        name: editName,
        description: editDescription,
        admin_owner_id: editCategory.admin_owner_id
      });
      
      if (updated) {
        toast({
          title: "Category updated",
          description: "The category was successfully updated",
        });
        onDataChange();
        setEditCategory(null);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the category. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (category: RankingCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    setIsLoading(true);
    try {
      const success = await CategoryService.delete(categoryToDelete.id);
      
      if (success) {
        toast({
          title: "Category deleted",
          description: "The category was successfully deleted",
        });
        onDataChange();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the category. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    setIsLoading(true);
    try {
      // Find the current index of the category
      const currentIndex = categories.findIndex(c => c.id === categoryId);
      if (currentIndex === -1) return;
      
      let newIndex;
      if (direction === 'up') {
        newIndex = Math.max(0, currentIndex - 1);
      } else {
        newIndex = Math.min(categories.length - 1, currentIndex + 1);
      }
      
      if (newIndex === currentIndex) return;
      
      const success = await CategoryService.updatePosition(categoryId, newIndex);
      
      if (success) {
        toast({
          title: "Category moved",
          description: `The category was successfully moved ${direction}`,
        });
        onDataChange();
      }
    } catch (error) {
      console.error(`Error moving category ${direction}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to move the category ${direction}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium mb-4">Categories ({categories.length})</div>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-md p-4">
                {editCategory?.id === category.id ? (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={`edit-name-${category.id}`} className="text-sm font-medium mb-2 block">Name</label>
                      <Input 
                        id={`edit-name-${category.id}`}
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        placeholder="Category name"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-description-${category.id}`} className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea 
                        id={`edit-description-${category.id}`}
                        value={editDescription} 
                        onChange={(e) => setEditDescription(e.target.value)} 
                        placeholder="Category description"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={cancelEdit}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={saveEdit}
                        disabled={isLoading || editName.trim() === '' || editDescription.trim() === ''}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => moveCategory(category.id, 'up')}
                        disabled={isLoading || categories.indexOf(category) === 0}
                        title="Move Up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => moveCategory(category.id, 'down')}
                        disabled={isLoading || categories.indexOf(category) === categories.length - 1}
                        title="Move Down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => startEdit(category)}
                        disabled={isLoading}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => confirmDelete(category)}
                        disabled={isLoading}
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {categories.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No categories found. Add your first category.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{categoryToDelete?.name}". 
              Sites belonging only to this category will be assigned to a hidden default category.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
