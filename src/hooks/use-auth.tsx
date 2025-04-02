
import { useContext } from 'react';
import { AuthContext } from "@/providers/auth-provider";
import { AuthContextType } from "@/types/auth-types";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Função auxiliar para verificar se o usuário é administrador
  const isAdmin = (): boolean => {
    return !!context.user?.role && context.user.role === 'admin';
  };
  
  // Retornando o contexto original juntamente com a nova função isAdmin
  return {
    ...context,
    isAdmin
  };
};
