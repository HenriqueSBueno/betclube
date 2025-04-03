
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCategoryForm } from "@/components/admin/add-category-form";
import { CategoryService } from "@/services/category-service";
import { RankingCategory } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CategoryList } from "@/components/admin/categories/category-list";

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
      
      <div className="space-y-6">
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
        ) : (
          <CategoryList categories={categories} onDataChange={handleCategoryAdded} />
        )}
      </div>
    </div>
  );
}
