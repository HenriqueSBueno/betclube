
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
      const { data, error } = await supabase
        .from("ranking_categories")
        .insert(category)
        .select()
        .single();

      if (error) {
        throw error;
      }

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
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  }
}
