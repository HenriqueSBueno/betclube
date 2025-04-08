import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/user-management";
import { SiteManagement } from "@/components/admin/site-management";
import { CategoryManagement } from "@/components/admin/category-management";
import { RankingsManagement } from "@/components/admin/rankings-management";
import { SiteSuggestionManagement } from "@/components/admin/site-suggestions-management";
import { SiteLabelsManagement } from "@/components/admin/site-labels-management";
import { TestSiteAdd } from "@/components/admin/test-site-add";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { CategoryService } from "@/services/category-service";
import { OnlineUsersService, OnlineUsersConfig } from "@/services/online-users-service";
import { RankingCategory } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState<RankingCategory[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [minUsers, setMinUsers] = useState("100");
  const [maxUsers, setMaxUsers] = useState("1000");
  const [updateInterval, setUpdateInterval] = useState("3");
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    const loadOnlineUsersConfig = async () => {
      try {
        const config = await OnlineUsersService.getConfig();
        if (config) {
          setMinUsers(config.min_count.toString());
          setMaxUsers(config.max_count.toString());
          setUpdateInterval((config.update_interval / 1000).toString());
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações do contador.",
          variant: "destructive"
        });
      }
    };

    if (isAuthenticated && isAdmin) {
      loadOnlineUsersConfig();
    }
  }, [isAuthenticated, isAdmin, toast]);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const updateCounter = async () => {
      if (!isMounted) return;

      try {
        const count = await OnlineUsersService.getCurrentCount();
        if (isMounted) {
          setCurrentCount(count);
        }
      } catch (error) {
        console.error('Erro ao atualizar contador:', error);
      }
    };

    updateCounter();

    intervalId = setInterval(updateCounter, 3000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const handleSaveOnlineUsersConfig = async () => {
    try {
      setIsUpdating(true);
      
      const min = parseInt(minUsers);
      const max = parseInt(maxUsers);
      const interval = parseInt(updateInterval) * 1000;

      if (isNaN(min) || isNaN(max) || isNaN(interval)) {
        throw new Error("Por favor, preencha todos os campos com valores numéricos válidos");
      }

      if (min < 0) {
        throw new Error("O valor mínimo não pode ser negativo");
      }

      if (max <= min) {
        throw new Error("O valor máximo deve ser maior que o valor mínimo");
      }

      if (interval < 1000) {
        throw new Error("O intervalo deve ser de pelo menos 1 segundo");
      }

      await OnlineUsersService.updateConfig({
        min_count: min,
        max_count: max,
        update_interval: interval
      });

      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive"
        });
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchCategories();
    }
  }, [isAuthenticated, isAdmin, refreshKey, toast]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive"
      });
      setAccessDenied(true);
    }
  }, [isLoading, isAuthenticated, isAdmin, toast]);

  if (accessDenied) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8">
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sites">Betting Sites</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="suggestions">Site Suggestions</TabsTrigger>
            <TabsTrigger value="labels">Rótulos</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="online-users">Online Users</TabsTrigger>
          </TabsList>

          <TabsContent value="sites">
            <SiteManagement 
              categories={categories} 
              onDataChange={() => setRefreshKey(prev => prev + 1)} 
            />
            <TestSiteAdd />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement onDataChange={() => setRefreshKey(prev => prev + 1)} />
          </TabsContent>

          <TabsContent value="rankings">
            <RankingsManagement 
              categories={categories} 
              onDataChange={() => setRefreshKey(prev => prev + 1)} 
            />
          </TabsContent>

          <TabsContent value="suggestions">
            <SiteSuggestionManagement />
          </TabsContent>

          <TabsContent value="labels">
            <SiteLabelsManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="online-users">
            <div className="container py-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Configurações do Contador de Usuários</h2>
                <p className="text-muted-foreground">
                  Configure os parâmetros do contador de usuários online.
                </p>
              </div>
              <div className="w-full">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="min" className="text-sm font-medium">
                        Mínimo de Usuários
                      </label>
                      <Input
                        id="min"
                        type="number"
                        value={minUsers}
                        onChange={(e) => setMinUsers(e.target.value)}
                        min="0"
                        disabled={isUpdating}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="max" className="text-sm font-medium">
                        Máximo de Usuários
                      </label>
                      <Input
                        id="max"
                        type="number"
                        value={maxUsers}
                        onChange={(e) => setMaxUsers(e.target.value)}
                        min="1"
                        disabled={isUpdating}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="interval" className="text-sm font-medium">
                        Intervalo de Atualização (segundos)
                      </label>
                      <Input
                        id="interval"
                        type="number"
                        value={updateInterval}
                        onChange={(e) => setUpdateInterval(e.target.value)}
                        min="1"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveOnlineUsersConfig}
                    disabled={isUpdating}
                    className="w-full md:w-auto"
                  >
                    {isUpdating ? "Salvando..." : "Salvar Configurações"}
                  </Button>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Valor Atual</h3>
                    <p className="text-2xl font-bold">{currentCount} usuários</p>
                    <p className="text-sm text-muted-foreground">
                      Atualizando a cada {updateInterval} segundos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
