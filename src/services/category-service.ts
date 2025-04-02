
import { supabase } from "@/integrations/supabase/client";
import { RankingCategory } from "@/types";

export class CategoryService {
  /**
   * Get all categories from the database
   */
  static async getAll(): Promise<RankingCategory[]> {
    try {
      const { data, error } = await supabase
        .from("ranking_categories")
        .select("*");

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
      }

      return data as RankingCategory[];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  /**
   * Get a category by ID
   */
  static async getById(id: string): Promise<RankingCategory | null> {
    try {
      const { data, error } = await supabase
        .from("ranking_categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar categoria por ID:", error);
        throw error;
      }

      return data as RankingCategory | null;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      return null;
    }
  }

  /**
   * Create a new category
   */
  static async create(category: Omit<RankingCategory, "id">): Promise<RankingCategory | null> {
    try {
      console.log("Enviando dados para criação de categoria:", category);
      
      // Garantir que o objeto de categoria está corretamente formatado
      const categoryData = {
        name: category.name,
        description: category.description,
        admin_owner_id: category.admin_owner_id
      };
      
      const { data, error } = await supabase
        .from("ranking_categories")
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar categoria:", error);
        throw error;
      }

      console.log("Categoria criada com sucesso:", data);
      return data as RankingCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
    }
  }

  /**
   * Update an existing category
   */
  static async update(id: string, category: Partial<RankingCategory>): Promise<RankingCategory | null> {
    try {
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

      return data as RankingCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      return null;
    }
  }

  /**
   * Delete a category by ID
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("ranking_categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir categoria:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  }
}
