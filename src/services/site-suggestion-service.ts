
import { supabase } from "@/integrations/supabase/client";

export interface SiteSuggestion {
  id: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  user_id?: string;
  ip: string;
  created_at: string;
}

export class SiteSuggestionService {
  static async submitSuggestion(url: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get client IP address from request headers (will be populated by Supabase)
      const { data, error } = await supabase.rpc(
        'submit_site_suggestion' as any, 
        {
          url_input: url,
          ip_address: "client-ip-auto-detected" // Supabase will replace this with actual IP
        }
      );

      if (error) throw error;
      return data as { success: boolean; message: string } || { success: true, message: "Sugestão enviada com sucesso!" };
    } catch (error: any) {
      console.error("Error submitting suggestion:", error);
      return { 
        success: false, 
        message: error.message || "Ocorreu um erro ao enviar a sugestão."
      };
    }
  }

  static async getAllSuggestions(): Promise<SiteSuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('site_suggestions' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as unknown as SiteSuggestion[]) || [];
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  }

  static async updateSuggestion(id: string, url: string, status: 'pending' | 'approved' | 'rejected'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_suggestions' as any)
        .update({ url, status })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating suggestion:", error);
      return false;
    }
  }

  static async deleteSuggestion(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_suggestions' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      return false;
    }
  }

  static exportToCsv(suggestions: SiteSuggestion[]): void {
    // Create CSV content
    let csvContent = "ID,URL,Status,Criado em\n";
    
    suggestions.forEach(suggestion => {
      const createdAt = new Date(suggestion.created_at).toLocaleDateString('pt-BR');
      csvContent += `${suggestion.id},${suggestion.url},${suggestion.status},${createdAt}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `site-suggestions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
