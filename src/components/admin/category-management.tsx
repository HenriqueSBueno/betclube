
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCategoryForm } from "@/components/admin/add-category-form";
import { CategoryService } from "@/services/category-service";
import { RankingCategory } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface CategoryManagementProps {
  onDataChange: () => void;
}

export function CategoryManagement({ onDataChange }: CategoryManagementProps) {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => await CategoryService.getAll(),
  });

  const handleCategoryAdded = () => {
    onDataChange();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>
            Create a new ranking category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddCategoryForm onSuccess={handleCategoryAdded} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories ({categories.length})</CardTitle>
          <CardDescription>
            All ranking categories in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading categories...</div>
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
