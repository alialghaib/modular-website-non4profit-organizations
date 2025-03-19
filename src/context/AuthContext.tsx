
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { signIn, signUp, signOut, getSession } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User> & { password: string, role: 'admin' | 'guide' | 'hiker' }) => Promise<void>;
  logout: () => void;
  checkRole: (roles: Array<'admin' | 'guide' | 'hiker'>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getSession();
        
        if (!error && data?.session?.user) {
          // The user from getSession should already be in the correct format
          // but we need to ensure it matches our User type
          const sessionUser = data.session.user as unknown as User;
          setUser(sessionUser);
          
          // Update user metadata with role if it's not already there
          if (sessionUser.role) {
            const { error: updateError } = await supabase.auth.updateUser({
              data: { role: sessionUser.role }
            });
            
            if (!updateError) {
              console.log("Updated auth metadata with role:", sessionUser.role);
            }
          }
          
          console.log("Auth session loaded, user role:", sessionUser.role);
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Don't show a toast here as it's not a user-initiated action
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Handle user login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error || !data?.user) {
        throw new Error(error?.message || 'Login failed');
      }
  
      console.log("Raw auth user data:", data.user);
      
    // Use the role from user_metadata
    let userRole = data.user.user_metadata?.role;
      if (!userRole || userRole === 'authenticated') {
        console.warn("User role is not set correctly, defaulting to hiker");
        userRole = 'hiker';
      }
      // Update user metadata with role
      if (data.user.user_metadata?.role) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: userRole },
        });
  
        if (!updateError) {
          console.log("Updated auth metadata with role:", userRole);
        }
      }
      
      // Manually update the local user state with the correct role
      const updatedUser = {
        ...data.user,
        user_metadata: {
        ...data.user.user_metadata,
        role: userRole,
        },
      };
      // Ensure type compatibility before setting the user
      setUser(updatedUser as unknown as User);
      console.log("Login successful, user role:", data.user.user_metadata?.role);
      toast.success('Logged in successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  

  // Handle user signup
  const signup = async (userData: Partial<User> & { password: string, role: 'admin' | 'guide' | 'hiker' }) => {
    try {
      setIsLoading(true);
      
      if (!userData.username || !userData.password || !userData.email || 
          !userData.firstName || !userData.lastName || !userData.role) {
        throw new Error('Required fields are missing');
      }
      
      const { user: newUser, error } = await signUp(userData);
      
      if (error || !newUser) {
        throw new Error(error || 'Signup failed');
      }
      
      console.log("Raw signup user data:", newUser);
      
      // Update the user's metadata with the selected role
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: userData.role }
      });

      if (updateError) {
        console.error("Error updating role:", updateError);
        // Optionally, you could throw an error here or choose to continue
      } else {
        console.log("Signup successful, user role updated to:", userData.role);
      }

      // Manually update the local user state with the correct role
      const updatedUser = {
        ...newUser,
        user_metadata: {
        ...newUser.user_metadata,
        role: userData.role,
      },
    };
      // Ensure the newUser is in the correct format for our User type
      setUser(updatedUser as unknown as User);
      console.log("Signup successful, user role:", updatedUser.user_metadata?.role);
      toast.success('Account created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user logout
  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has required role
  const checkRole = (roles: Array<'admin' | 'guide' | 'hiker'>) => {
    if (!user) return false;
    console.log("Checking role:", user.role, "against allowed roles:", roles);
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        checkRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
