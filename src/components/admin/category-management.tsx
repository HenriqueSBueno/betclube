
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCategoryForm } from "@/components/admin/add-category-form";
import { mockDb } from "@/lib/mockDb";
import { RankingCategory } from "@/types";

interface CategoryManagementProps {
  onDataChange: () => void;
}

export function CategoryManagement({ onDataChange }: CategoryManagementProps) {
  const [categories, setCategories] = useState<RankingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCategories(mockDb.rankingCategories.getAll());
    setIsLoading(false);
  }, []);

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
          <AddCategoryForm onSuccess={onDataChange} />
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
