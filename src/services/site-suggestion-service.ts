
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
      console.log("Enviando sugestão de site para o Supabase:", url);
      
      // Chamar a função RPC 'submit_site_suggestion' no Supabase
      const { data, error } = await supabase.rpc(
        'submit_site_suggestion',
        {
          url_input: url,
          ip_address: "client-ip-auto-detected" // Supabase substituirá isso pelo IP real
        }
      );

      if (error) {
        console.error("Erro do Supabase:", error);
        return { 
          success: false, 
          message: error.message || "Ocorreu um erro ao enviar a sugestão."
        };
      }
      
      console.log("Sugestão enviada com sucesso:", data);
      return data as { success: boolean; message: string } || { success: true, message: "Sugestão enviada com sucesso!" };
    } catch (error: any) {
      console.error("Erro ao enviar sugestão:", error);
      return { 
        success: false, 
        message: error.message || "Ocorreu um erro ao enviar a sugestão."
      };
    }
  }

  static async getAllSuggestions(): Promise<SiteSuggestion[]> {
    try {
      console.log("Buscando todas as sugestões");
      
      const { data, error } = await supabase
        .from('site_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro do Supabase:", error);
        throw error;
      }
      
      console.log("Sugestões encontradas:", data);
      return (data as SiteSuggestion[]) || [];
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
      return [];
    }
  }

  static async updateSuggestion(id: string, url: string, status: 'pending' | 'approved' | 'rejected'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_suggestions')
        .update({ url, status })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao atualizar sugestão:", error);
      return false;
    }
  }

  static async deleteSuggestion(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao excluir sugestão:", error);
      return false;
    }
  }

  static exportToCsv(suggestions: SiteSuggestion[]): void {
    // Criar conteúdo CSV
    let csvContent = "ID,URL,Status,Criado em\n";
    
    suggestions.forEach(suggestion => {
      const createdAt = new Date(suggestion.created_at).toLocaleDateString('pt-BR');
      csvContent += `${suggestion.id},${suggestion.url},${suggestion.status},${createdAt}\n`;
    });
    
    // Criar link de download
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
