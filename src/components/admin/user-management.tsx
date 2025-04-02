
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, User } from "lucide-react";
import { PromoteUser } from "./promote-user";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  email?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First get all profiles from the database
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role, created_at');
        
      if (profilesError) throw profilesError;
      
      if (!profiles) {
        setUsers([]);
        return;
      }
      
      // Now get auth users via the API, this might require admin rights
      // We'll handle potential failures gracefully
      let authUsers: AdminUser[] = [];
      try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (!error && data?.users) {
          authUsers = data.users.map(user => ({
            id: user.id,
            email: user.email
          }));
        }
      } catch (e) {
        console.error("Error fetching auth users:", e);
        // Continue with profiles only if auth users fail
      }
      
      // Combine the data, handling the case where auth users might be missing
      const combinedUsers = profiles.map((profile): UserProfile => {
        const authUser = authUsers.find((user) => user.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || 'Email não disponível',
          role: profile.role,
          created_at: profile.created_at,
        };
      });
      
      setUsers(combinedUsers);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar usuários',
        description: error.message || 'Não foi possível carregar os usuários',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAdminRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: 'Perfil atualizado',
        description: `Usuário agora é ${newRole === 'admin' ? 'administrador' : 'usuário comum'}`,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Não foi possível atualizar o perfil',
      });
    }
  };
  
  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <PromoteUser />
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Gerencie perfis de usuários e atribua funções administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando usuários...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Registro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getUserInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="h-4 w-4 text-blue-500" />
                            Administrador
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4" />
                            Usuário
                          </>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={user.role === 'admin' ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleAdminRole(user.id, user.role)}
                      >
                        {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
