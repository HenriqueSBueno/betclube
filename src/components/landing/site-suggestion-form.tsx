
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL é obrigatória",
        description: "Por favor, informe a URL do site que deseja sugerir.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await SiteSuggestionService.submitSuggestion(url);
      
      if (result.success) {
        toast({
          title: "Sugestão enviada!",
          description: "Obrigado pela sua sugestão. Nossa equipe irá analisá-la em breve.",
          variant: "default",
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
      console.error("Error submitting suggestion:", error);
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
    <div className="w-full max-w-md mx-auto mt-6">
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
