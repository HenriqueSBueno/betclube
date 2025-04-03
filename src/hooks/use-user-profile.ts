
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { AuthUser, UserProfile } from "@/types/auth-types";

export const fetchUserProfile = async (userId: string, userObj: User): Promise<AuthUser> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, email, username')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return userObj;
    }
    
    const profile = data as UserProfile;
    
    return { 
      ...userObj, 
      role: profile?.role || 'user',
      username: profile?.username || undefined
    } as AuthUser;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return userObj;
  }
};
