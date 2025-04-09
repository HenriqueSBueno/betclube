
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SiteSuggestionService } from "@/services/site-suggestion-service";
import { URLInput } from "@/components/ui/url-input";

interface SiteSuggestionFormProps {
  disabled?: boolean;
}

export function SiteSuggestionForm({ disabled }: SiteSuggestionFormProps) {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "URL é obrigatória",
        description: "Por favor, informe a URL do site que deseja sugerir.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Enviando sugestão de site:", url);
      const result = await SiteSuggestionService.submitSuggestion(url);
      
      console.log("Resposta do serviço:", result);
      
      if (result.success) {
        toast({
          title: "Sugestão enviada!",
          description: "Obrigado pela sua sugestão. Nossa equipe irá analisá-la em breve.",
        });
        setUrl("");
      } else {
        toast({
          title: "Erro ao enviar sugestão",
          description: result.message || "Ocorreu um erro ao enviar a sugestão. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
      toast({
        title: "Erro ao enviar sugestão",
        description: "Ocorreu um erro ao enviar a sugestão. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <URLInput
            value={url}
            onChange={setUrl}
            placeholder="exemplo.com"
            className="bg-white/90 dark:bg-black/70 backdrop-blur-sm"
            disabled={disabled || isSubmitting}
          />
        </div>
        <Button 
          type="submit" 
          disabled={disabled || isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? "Enviando..." : "Sugerir Site"}
        </Button>
      </form>
    </div>
  );
}
