
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCategoryForm } from "@/components/admin/add-category-form";
import { CategoryService } from "@/services/category-service";
import { RankingCategory } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagementProps {
  onDataChange: () => void;
}

export function CategoryManagement({ onDataChange }: CategoryManagementProps) {
  const [categories, setCategories] = useState<RankingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Função para buscar categorias
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCategories = await CategoryService.getAll();
      console.log("Categorias recebidas no componente:", fetchedCategories);
      setCategories(fetchedCategories);
    } catch (err: any) {
      console.error("Erro ao buscar categorias:", err);
      setError(err.message || "Não foi possível carregar as categorias");
      toast({
        variant: "destructive",
        title: "Erro de dados",
        description: "Não foi possível carregar as categorias. Por favor, tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar categorias quando o componente for montado
  useEffect(() => {
    fetchCategories();
  }, []);

  // Função chamada quando uma categoria é adicionada com sucesso
  const handleCategoryAdded = () => {
    console.log("Categoria adicionada, atualizando lista...");
    fetchCategories();
    onDataChange();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Categoria</CardTitle>
          <CardDescription>
            Crie uma nova categoria de ranking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddCategoryForm onSuccess={handleCategoryAdded} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Categorias Existentes ({!isLoading ? categories.length : '-'})</CardTitle>
          <CardDescription>
            Todas as categorias de ranking no banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">Nenhuma categoria encontrada</div>
          ) : (
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.id} className="border-b pb-3">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {category.description}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
