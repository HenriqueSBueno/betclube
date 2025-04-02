
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
        .select("*");

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        return [];
      }

      console.log("CategoryService: Categorias recebidas:", data);
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
      console.log(`CategoryService: Buscando categoria por ID: ${id}`);
      const { data, error } = await supabase
        .from("ranking_categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar categoria por ID:", error);
        return null;
      }

      console.log("CategoryService: Categoria encontrada:", data);
      return data as RankingCategory;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      return null;
    }
  }

  /**
   * Create a new category
   */
  static async create(category: { name: string; description: string; admin_owner_id: string }): Promise<RankingCategory | null> {
    try {
      console.log("CategoryService: Criando categoria:", category);
      
      const { data, error } = await supabase
        .from("ranking_categories")
        .insert(category)
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar categoria:", error);
        return null;
      }

      console.log("CategoryService: Categoria criada com sucesso:", data);
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
        return null;
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
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  }
}
