
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types';
import { mockDb } from './mockDb';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for stored auth in localStorage
    const storedUser = localStorage.getItem('bettingBuzzUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('bettingBuzzUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, we'd validate the password
    // Here we just check if the user exists and set as logged in
    try {
      const foundUser = mockDb.users.findByEmail(email);
      
      if (foundUser) {
        // For demo purposes, we're accepting any password
        const updatedUser = mockDb.users.update(foundUser.id, { 
          lastLogin: new Date() 
        });
        
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem('bettingBuzzUser', JSON.stringify(updatedUser));
          toast({
            title: 'Login successful',
            description: `Welcome back, ${email}!`,
          });
          return true;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Invalid email or password',
      });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login error',
        description: 'An error occurred during login',
      });
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      // Check if user already exists
      const existingUser = mockDb.users.findByEmail(email);
      
      if (existingUser) {
        toast({
          variant: 'destructive',
          title: 'Registration failed',
          description: 'Email already in use',
        });
        return false;
      }
      
      // Create new user (in a real app, we'd hash the password)
      const newUser = mockDb.users.create({
        email,
        role: 'user',
        registrationDate: new Date(),
        lastLogin: new Date()
      });
      
      setUser(newUser);
      localStorage.setItem('bettingBuzzUser', JSON.stringify(newUser));
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created',
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration error',
        description: 'An error occurred during registration',
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bettingBuzzUser');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
