import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { SiteLabelService } from "@/services/site-label-service";
import { SiteLabel } from "@/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const labelFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  color: z.string().min(1, "Cor é obrigatória").regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Formato de cor inválido"),
});

type LabelFormValues = z.infer<typeof labelFormSchema>;

export function SiteLabelsManagement() {
  const [labels, setLabels] = useState<SiteLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLabel, setEditingLabel] = useState<SiteLabel | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6"
    }
  });
  
  // Carregar rótulos
  const loadLabels = async () => {
    try {
      setIsLoading(true);
      const data = await SiteLabelService.getAll();
      setLabels(data);
    } catch (error) {
      console.error("Erro ao carregar rótulos:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os rótulos. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadLabels();
  }, []);
  
  // Configurar formulário quando editando
  useEffect(() => {
    if (editingLabel) {
      form.reset({
        name: editingLabel.name,
        color: editingLabel.color
      });
    } else {
      form.reset({
        name: "",
        color: "#3b82f6"
      });
    }
  }, [editingLabel, form]);
  
  // Adicionar ou atualizar rótulo
  const onSubmit = async (values: LabelFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (editingLabel) {
        // Atualizar
        await SiteLabelService.update(editingLabel.id, values);
        toast({
          title: "Rótulo atualizado",
          description: `O rótulo ${values.name} foi atualizado com sucesso.`
        });
      } else {
        // Certifique-se de que estamos passando todos os campos obrigatórios
        await SiteLabelService.create({
          name: values.name,
          color: values.color,
          admin_owner_id: user.id
        });
        toast({
          title: "Rótulo criado",
          description: `O rótulo ${values.name} foi criado com sucesso.`
        });
      }
      
      // Resetar form e recarregar dados
      form.reset();
      setEditingLabel(null);
      loadLabels();
    } catch (error) {
      console.error("Erro ao salvar rótulo:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o rótulo. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Iniciar edição de rótulo
  const handleEdit = (label: SiteLabel) => {
    setEditingLabel(label);
  };
  
  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingLabel(null);
    form.reset({
      name: "",
      color: "#3b82f6"
    });
  };
  
  // Confirmar exclusão
  const handleConfirmDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };
  
  // Excluir rótulo
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    
    setIsLoading(true);
    try {
      await SiteLabelService.delete(deleteTargetId);
      toast({
        title: "Rótulo excluído",
        description: "O rótulo foi excluído com sucesso."
      });
      loadLabels();
    } catch (error) {
      console.error("Erro ao excluir rótulo:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o rótulo. Tente novamente."
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingLabel ? "Editar Rótulo" : "Adicionar Novo Rótulo"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Rótulo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Promoção" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input type="text" placeholder="#3b82f6" {...field} disabled={isLoading} />
                        </FormControl>
                        <Input 
                          type="color" 
                          value={field.value} 
                          onChange={field.onChange}
                          className="w-12 p-1 h-10"
                          disabled={isLoading}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                {editingLabel && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isLoading || !form.formState.isValid}
                >
                  {editingLabel ? "Atualizar" : "Adicionar"} Rótulo
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Rótulos Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {labels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labels.map((label) => (
                  <TableRow key={label.id}>
                    <TableCell className="font-medium">{label.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border" 
                          style={{ backgroundColor: label.color }}
                        />
                        <span>{label.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(label)}
                          disabled={isLoading}
                          aria-label={`Editar ${label.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleConfirmDelete(label.id)}
                          disabled={isLoading}
                          aria-label={`Excluir ${label.name}`}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {isLoading ? "Carregando rótulos..." : "Nenhum rótulo cadastrado ainda."}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Rótulo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este rótulo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
