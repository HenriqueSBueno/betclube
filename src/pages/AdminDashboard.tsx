
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/user-management";
import { SiteManagement } from "@/components/admin/site-management";
import { CategoryManagement } from "@/components/admin/category-management";
import { RankingsManagement } from "@/components/admin/rankings-management";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Função para forçar atualização de dados quando algo muda
  const handleDataChange = () => {
    console.log("Atualizando dados em AdminDashboard");
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    toast({
      title: "Acesso negado",
      description: "Você precisa estar logado como administrador para acessar esta página.",
      variant: "destructive"
    });
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
        
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sites">Betting Sites</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sites">
            <SiteManagement onDataChange={handleDataChange} />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategoryManagement onDataChange={handleDataChange} />
          </TabsContent>
          
          <TabsContent value="rankings">
            <RankingsManagement onDataChange={handleDataChange} />
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
