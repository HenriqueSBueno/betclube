
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  role: string;
  email: string | null;
  username?: string;
}

export interface AuthUser extends User {
  role?: string;
  username?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  updateProfile?: (data: Partial<UserProfile>) => Promise<boolean>;
  updatePassword?: (password: string) => Promise<boolean>;
}
