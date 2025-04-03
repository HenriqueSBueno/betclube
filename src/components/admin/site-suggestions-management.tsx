
import React, { useState, useEffect } from "react";
import { SiteSuggestion, SiteSuggestionService } from "@/services/site-suggestion-service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, FileText, Download } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function SiteSuggestionManagement() {
  const [suggestions, setSuggestions] = useState<SiteSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSuggestion, setEditingSuggestion] = useState<SiteSuggestion | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const formSchema = z.object({
    url: z.string().url({ message: "URL inválida" }),
    status: z.enum(["pending", "approved", "rejected"], {
      required_error: "Por favor selecione um status",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      status: "pending",
    },
  });

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const data = await SiteSuggestionService.getAllSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar sugestões",
        description: "Não foi possível carregar as sugestões de sites.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta sugestão?")) {
      const success = await SiteSuggestionService.deleteSuggestion(id);
      if (success) {
        setSuggestions(suggestions.filter((s) => s.id !== id));
        toast({
          title: "Sugestão excluída",
          description: "A sugestão foi excluída com sucesso.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Não foi possível excluir a sugestão.",
        });
      }
    }
  };

  const handleEdit = (suggestion: SiteSuggestion) => {
    setEditingSuggestion(suggestion);
    form.reset({
      url: suggestion.url,
      status: suggestion.status,
    });
    setIsEditDialogOpen(true);
  };

  const onSubmitEdit = async (values: z.infer<typeof formSchema>) => {
    if (!editingSuggestion) return;
    
    const success = await SiteSuggestionService.updateSuggestion(
      editingSuggestion.id,
      values.url,
      values.status as 'pending' | 'approved' | 'rejected'
    );
    
    if (success) {
      setSuggestions(
        suggestions.map((s) =>
          s.id === editingSuggestion.id
            ? { ...s, url: values.url, status: values.status as 'pending' | 'approved' | 'rejected' }
            : s
        )
      );
      toast({
        title: "Sugestão atualizada",
        description: "A sugestão foi atualizada com sucesso.",
      });
      setIsEditDialogOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a sugestão.",
      });
    }
  };

  const handleExportCsv = () => {
    SiteSuggestionService.exportToCsv(suggestions);
    toast({
      title: "CSV exportado",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciamento de Sugestões de Sites</CardTitle>
          <CardDescription>
            Visualize e gerencie as sugestões de sites enviadas pelos usuários
          </CardDescription>
        </div>
        <Button onClick={handleExportCsv} className="ml-4">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-lg">Carregando sugestões...</div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma sugestão encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell className="font-medium">
                      <a 
                        href={suggestion.url.startsWith('http') ? suggestion.url : `https://${suggestion.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {suggestion.url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          suggestion.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : suggestion.status === "rejected"
                            ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                        }`}
                      >
                        {suggestion.status === "approved" ? "Aprovado" : 
                         suggestion.status === "rejected" ? "Rejeitado" : "Pendente"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(suggestion.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        className="mr-1"
                        onClick={() => handleEdit(suggestion)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(suggestion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Sugestão de Site</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da sugestão de site
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
