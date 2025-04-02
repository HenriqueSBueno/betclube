
import { useState } from "react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CategoryService } from "@/services/category-service";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres.")
});

type FormValues = z.infer<typeof formSchema>;

interface AddCategoryFormProps {
  onSuccess: () => void;
}

export function AddCategoryForm({ onSuccess }: AddCategoryFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!user || !user.id) {
      setError("Você precisa estar logado para adicionar categorias.");
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para adicionar categorias."
      });
      return;
    }
    
    if (user.role !== "admin") {
      setError("Apenas administradores podem adicionar categorias.");
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você não tem permissão para adicionar categorias."
      });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Iniciando criação de categoria:", {
        name: values.name,
        description: values.description,
        admin_owner_id: user.id
      });
      
      const newCategory = await CategoryService.create({
        name: values.name,
        description: values.description,
        admin_owner_id: user.id
      });
      
      if (newCategory) {
        toast({
          title: "Categoria adicionada",
          description: `A categoria ${values.name} foi adicionada com sucesso.`
        });
        
        form.reset();
        onSuccess();
      } else {
        throw new Error("Falha ao adicionar categoria");
      }
    } catch (err: any) {
      console.error("Falha ao adicionar categoria:", err);
      setError(err.message || "Ocorreu um erro ao adicionar a categoria. Por favor, tente novamente.");
      toast({
        variant: "destructive",
        title: "Falha ao adicionar categoria",
        description: err.message || "Ocorreu um erro ao adicionar a categoria. Por favor, tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Categoria</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar Categoria"}
          </Button>
        </form>
      </Form>
    </>
  );
}
