
import { supabase } from "@/integrations/supabase/client";
import { RankingCategory } from "@/types";

export class CategoryService {
  /**
   * Get all categories from the database
   */
  static async getAll(): Promise<RankingCategory[]> {
    try {
      console.log("CategoryService: Buscando todas categorias");
      const { data, error } = await supabase
        .from("ranking_categories")
        .select("*")
        .order('position', { ascending: true });

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
      }

      console.log("CategoryService: Categorias recebidas:", data);
      return data as RankingCategory[];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Get a category by ID
   */
  static async getById(id: string): Promise<RankingCategory | null> {
    try {
      console.log(`CategoryService: Buscando categoria por ID: ${id}`);
      const { data, error } = await supabase
        .from("ranking_categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar categoria por ID:", error);
        throw error;
      }

      console.log("CategoryService: Categoria encontrada:", data);
      return data as RankingCategory;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  static async create(category: { name: string; description: string; admin_owner_id: string }): Promise<RankingCategory | null> {
    try {
      console.log("CategoryService: Criando categoria:", category);
      
      // Verificar se temos todos os dados necessários
      if (!category.name || !category.description || !category.admin_owner_id) {
        throw new Error("Dados incompletos para criar categoria");
      }
      
      // Get the highest position value
      const { data: maxPositionData, error: maxPositionError } = await supabase
        .from("ranking_categories")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
        
      const nextPosition = (maxPositionData && maxPositionData.position !== undefined) 
        ? (maxPositionData.position + 1) 
        : 0;
      
      const { data, error } = await supabase
        .from("ranking_categories")
        .insert([{ ...category, position: nextPosition }])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar categoria:", error);
        throw error;
      }

      console.log("CategoryService: Categoria criada com sucesso:", data);
      return data as RankingCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  /**
   * Update an existing category
   */
  static async update(id: string, category: Partial<RankingCategory>): Promise<RankingCategory | null> {
    try {
      // Get the original category before updating
      const { data: originalCategory, error: getError } = await supabase
        .from("ranking_categories")
        .select("name")
        .eq("id", id)
        .single();
        
      if (getError) {
        console.error("Error fetching original category:", getError);
        throw getError;
      }
      
      // Update the category
      const { data, error } = await supabase
        .from("ranking_categories")
        .update(category)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar categoria:", error);
        throw error;
      }
      
      // If category name was updated, update all sites that reference this category
      if (category.name && originalCategory && originalCategory.name !== category.name) {
        console.log(`Category name changed from '${originalCategory.name}' to '${category.name}'. Updating sites...`);
        await this.updateCategoryNameInSites(originalCategory.name, category.name);
      }

      return data as RankingCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  /**
   * Update category name in all sites that reference it
   */
  private static async updateCategoryNameInSites(oldName: string, newName: string): Promise<boolean> {
    try {
      console.log(`Updating sites with category name from '${oldName}' to '${newName}'`);
      
      // Get all sites that include this category
      const { data: sites, error: sitesError } = await supabase
        .from("betting_sites")
        .select("id, category");
        
      if (sitesError) {
        console.error("Error fetching sites:", sitesError);
        return false;
      }
      
      // Update each site's category array
      for (const site of sites) {
        if (site.category.includes(oldName)) {
          const updatedCategories = site.category.map((cat: string) => 
            cat === oldName ? newName : cat
          );
          
          console.log(`Updating site ${site.id} categories:`, site.category, "->", updatedCategories);
          
          const { error: updateError } = await supabase
            .from("betting_sites")
            .update({ category: updatedCategories })
            .eq("id", site.id);
            
          if (updateError) {
            console.error(`Error updating site ${site.id}:`, updateError);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error updating category name in sites:", error);
      return false;
    }
  }

  /**
   * Delete a category by ID
   */
  static async delete(id: string): Promise<boolean> {
    try {
      // First get the category to be deleted
      const { data: categoryToDelete, error: categoryError } = await supabase
        .from("ranking_categories")
        .select("name")
        .eq("id", id)
        .single();
        
      if (categoryError) {
        console.error("Error fetching category to delete:", categoryError);
        throw categoryError;
      }
      
      const categoryName = categoryToDelete.name;
      
      // Handle sites with this category
      await this.handleSitesOnCategoryDelete(categoryName);
      
      // Delete any rankings associated with this category
      const { error: deleteRankingsError } = await supabase
        .rpc("delete_rankings_by_category", { p_category_id: id });
        
      if (deleteRankingsError) {
        console.error("Error deleting rankings for category:", deleteRankingsError);
      }
      
      // Finally delete the category
      const { error } = await supabase
        .from("ranking_categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir categoria:", error);
        throw error;
      }
      
      // Reorder remaining categories
      await this.reorderCategoriesAfterDelete();

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
  
  /**
   * Handle sites when a category is deleted
   */
  private static async handleSitesOnCategoryDelete(categoryName: string): Promise<void> {
    try {
      // Get all sites that include this category
      const { data: sites, error: sitesError } = await supabase
        .from("betting_sites")
        .select("id, category");
        
      if (sitesError) {
        console.error("Error fetching sites:", sitesError);
        return;
      }
      
      const DEFAULT_CATEGORY = "NAN";
      
      // Update each site's category array
      for (const site of sites) {
        if (site.category.includes(categoryName)) {
          let updatedCategories = site.category.filter((cat: string) => cat !== categoryName);
          
          // If this was the only category, assign the default hidden category
          if (updatedCategories.length === 0) {
            updatedCategories = [DEFAULT_CATEGORY];
          }
          
          const { error: updateError } = await supabase
            .from("betting_sites")
            .update({ category: updatedCategories })
            .eq("id", site.id);
            
          if (updateError) {
            console.error(`Error updating site ${site.id}:`, updateError);
          }
        }
      }
    } catch (error) {
      console.error("Error handling sites on category delete:", error);
    }
  }
  
  /**
   * Reorder categories after a deletion
   */
  private static async reorderCategoriesAfterDelete(): Promise<void> {
    try {
      // Get all categories ordered by current position
      const { data: categories, error: fetchError } = await supabase
        .from("ranking_categories")
        .select("id, position")
        .order("position", { ascending: true });
        
      if (fetchError || !categories) {
        console.error("Error fetching categories for reordering:", fetchError);
        return;
      }
      
      // Update each category with a new sequential position
      for (let i = 0; i < categories.length; i++) {
        if (categories[i].position !== i) {
          const { error: updateError } = await supabase
            .from("ranking_categories")
            .update({ position: i })
            .eq("id", categories[i].id);
            
          if (updateError) {
            console.error(`Error updating position for category ${categories[i].id}:`, updateError);
          }
        }
      }
    } catch (error) {
      console.error("Error reordering categories:", error);
    }
  }

  /**
   * Update category position
   */
  static async updatePosition(categoryId: string, newIndex: number): Promise<boolean> {
    try {
      // Get all categories ordered by position
      const { data: categories, error: fetchError } = await supabase
        .from("ranking_categories")
        .select("id, position")
        .order("position", { ascending: true });
        
      if (fetchError || !categories) {
        console.error("Error fetching categories:", fetchError);
        return false;
      }
      
      // Find the current index of the category
      const categoryIndex = categories.findIndex(c => c.id === categoryId);
      if (categoryIndex === -1) return false;
      
      // Skip if the category is already at the desired position
      if (categoryIndex === newIndex) return true;
      
      // Update the positions
      if (newIndex < categoryIndex) {
        // Moving up: increment positions of categories between newIndex and categoryIndex
        for (let i = newIndex; i < categoryIndex; i++) {
          await supabase
            .from("ranking_categories")
            .update({ position: categories[i].position + 1 })
            .eq("id", categories[i].id);
        }
      } else {
        // Moving down: decrement positions of categories between categoryIndex and newIndex
        for (let i = categoryIndex + 1; i <= newIndex; i++) {
          await supabase
            .from("ranking_categories")
            .update({ position: categories[i].position - 1 })
            .eq("id", categories[i].id);
        }
      }
      
      // Update the position of the moved category
      const { error } = await supabase
        .from("ranking_categories")
        .update({ position: newIndex })
        .eq("id", categoryId);
        
      if (error) {
        console.error("Error updating category position:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error updating category position:", error);
      return false;
    }
  }
}
