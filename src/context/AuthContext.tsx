
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { signIn, signUp, signOut, getSession } from '@/lib/supabase';
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
      const { data, error } = await getSession();
      
      if (!error && data?.session?.user) {
        setUser(data.session.user as User);
      }
      
      setIsLoading(false);
    };
    
    checkSession();
  }, []);

  // Handle user login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: authUser, error } = await signIn(email, password);
      
      if (error || !authUser) {
        throw new Error(error || 'Login failed');
      }
      
      setUser(authUser);
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
      
      setUser(newUser);
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
