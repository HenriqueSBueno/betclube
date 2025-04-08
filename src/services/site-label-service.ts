
import { supabase } from "@/integrations/supabase/client";
import { SiteLabel } from "@/types";

export class SiteLabelService {
  static async getAll(): Promise<SiteLabel[]> {
    const { data, error } = await supabase
      .from("site_labels")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar rótulos:", error);
      throw error;
    }

    return data || [];
  }

  static async create(label: { name: string; color: string; admin_owner_id: string }): Promise<SiteLabel> {
    const { data, error } = await supabase
      .from("site_labels")
      .insert([label])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar rótulo:", error);
      throw error;
    }

    return data;
  }

  static async update(id: string, label: { name?: string; color?: string }): Promise<SiteLabel> {
    const { data, error } = await supabase
      .from("site_labels")
      .update(label)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar rótulo:", error);
      throw error;
    }

    return data;
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("site_labels")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir rótulo:", error);
      throw error;
    }

    return true;
  }
}
