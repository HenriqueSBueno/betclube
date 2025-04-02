
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/user-management";
import { SiteManagement } from "@/components/admin/site-management";
import { CategoryManagement } from "@/components/admin/category-management";
import { RankingsManagement } from "@/components/admin/rankings-management";
import { useAuth } from "@/lib/auth";
import { RankingCategory } from "@/types";
import { mockDb } from "@/lib/mockDb";

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [categories, setCategories] = useState<RankingCategory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const loadData = () => {
    setCategories(mockDb.rankingCategories.getAll());
    setDataLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      loadData();
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage betting sites, categories, and generate daily rankings.
          </p>
        </div>
        
        <Tabs defaultValue="sites" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sites">Betting Sites</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sites">
            <SiteManagement categories={categories} onDataChange={loadData} />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategoryManagement onDataChange={loadData} />
          </TabsContent>
          
          <TabsContent value="rankings">
            <RankingsManagement categories={categories} onDataChange={loadData} />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
