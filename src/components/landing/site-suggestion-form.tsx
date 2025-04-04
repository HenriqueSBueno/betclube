
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SiteSuggestionService } from "@/services/site-suggestion-service";
import { LinkIcon } from "lucide-react";

export function SiteSuggestionForm() {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateUrl = (url: string): boolean => {
    // Basic URL validation using regex
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
    return urlPattern.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast({
        title: "URL é obrigatória",
        description: "Por favor, informe a URL do site que deseja sugerir.",
        variant: "destructive",
      });
      return;
    }

    // Add URL validation
    if (!validateUrl(trimmedUrl)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida (ex: https://exemplo.com).",
        variant: "destructive",
      });
      return;
    }

    // Ensure URL has http/https protocol
    let formattedUrl = trimmedUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Enviando sugestão de site:", formattedUrl);
      const result = await SiteSuggestionService.submitSuggestion(formattedUrl);
      
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
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="pr-10 bg-white/90 dark:bg-black/70 backdrop-blur-sm"
            disabled={isSubmitting}
          />
          <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-70" />
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? "Enviando..." : "Sugerir Site"}
        </Button>
      </form>
    </div>
  );
}
