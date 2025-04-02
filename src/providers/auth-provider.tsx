
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, AuthContextType } from "@/types/auth-types";
import { fetchUserProfile } from "@/hooks/use-user-profile";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Defer profile fetching to avoid auth state deadlock
          setTimeout(async () => {
            const enrichedUser = await fetchUserProfile(
              currentSession.user.id, 
              currentSession.user
            );
            setUser(enrichedUser);
          }, 0);
        } else {
          setUser(null);
        }
        
        if (event === 'SIGNED_IN') {
          toast({
            title: 'Login realizado',
            description: 'Você foi conectado com sucesso',
          });
        }
        
        if (event === 'SIGNED_OUT') {
          toast({
            title: 'Desconectado',
            description: 'Você foi desconectado com sucesso',
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        const enrichedUser = await fetchUserProfile(
          currentSession.user.id, 
          currentSession.user
        );
        setUser(enrichedUser);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add isAdmin function to check if the user has admin role
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao fazer login',
          description: error.message,
        });
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: 'Ocorreu um erro durante o login',
      });
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao registrar',
          description: error.message,
        });
        return false;
      }

      toast({
        title: 'Registro realizado',
        description: 'Por favor, verifique seu email para confirmar o cadastro',
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar',
        description: 'Ocorreu um erro durante o registro',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao desconectar',
        description: 'Ocorreu um erro ao desconectar',
      });
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
