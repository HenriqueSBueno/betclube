
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCategoryForm } from "@/components/admin/add-category-form";
import { CategoryService } from "@/services/category-service";
import { RankingCategory } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CategoryManagementProps {
  onDataChange: () => void;
}

export function CategoryManagement({ onDataChange }: CategoryManagementProps) {
  const queryClient = useQueryClient();
  
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log("Buscando categorias do servidor...");
      const results = await CategoryService.getAll();
      console.log("Categorias recebidas:", results);
      return results;
    },
  });

  const handleCategoryAdded = () => {
    console.log("Categoria adicionada, invalidando query...");
    // Invalidar a consulta para recarregar os dados
    queryClient.invalidateQueries({ queryKey: ['categories'] });
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
          <CardTitle>Categorias Existentes ({categories.length})</CardTitle>
          <CardDescription>
            Todas as categorias de ranking no banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando categorias...</div>
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
