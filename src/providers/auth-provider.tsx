
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, AuthContextType, UserProfile } from "@/types/auth-types";
import { fetchUserProfile } from "@/hooks/use-user-profile";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[AuthProvider] Auth state changed:", event, !!currentSession);
        
        if (currentSession?.user) {
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

        setSession(currentSession);
        
        if (hasInitialized) {
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
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("[AuthProvider] Initial session check:", !!currentSession);
      
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
      setHasInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user?.id) return false;
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
      });
      return false;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Failed to update password',
      });
      return false;
    }
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

  const register = async (email: string, password: string, username?: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            username: username
          }
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

      // If user is created, update the profile with the username
      if (data?.user && username) {
        await supabase
          .from('profiles')
          .update({ username })
          .eq('id', data.user.id);
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
    isAdmin,
    updateProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
