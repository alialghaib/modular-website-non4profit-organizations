
import { createClient } from '@supabase/supabase-js';
import { User } from '@/lib/types';

// Initialize Supabase client (these are public keys)
const supabaseUrl = 'https://supabaseprojecturl.supabase.co';
const supabaseAnonKey = 'public-anon-key-for-demo-purposes-only';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User registration function
export const signUp = async (userData: Partial<User> & { password: string, role: 'admin' | 'guide' | 'hiker' }) => {
  try {
    // Demo implementation - simulates user creation
    const mockUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      username: userData.username || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      isEmailVerified: false,
      isPhoneVerified: false,
      role: userData.role,
      stripeCustomerId: userData.role === 'hiker' ? `cus_${Math.random().toString(36).substring(2, 10)}` : undefined
    };
    
    // Store in localStorage for demo purposes
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return { user: mockUser, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return { user: null, error: 'Signup failed' };
  }
};

// User login function
export const signIn = async (email: string, password: string) => {
  try {
    // Demo users for testing
    const mockUsers = {
      'admin@example.com': {
        id: '1',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        phone: '555-123-4567',
        isEmailVerified: true,
        isPhoneVerified: true,
        role: 'admin' as const
      },
      'guide@example.com': {
        id: '2',
        username: 'guide',
        firstName: 'John',
        lastName: 'Guide',
        email: 'guide@example.com',
        phone: '555-234-5678',
        isEmailVerified: true,
        isPhoneVerified: true,
        role: 'guide' as const
      },
      'hiker@example.com': {
        id: '3',
        username: 'hiker',
        firstName: 'Jane',
        lastName: 'Hiker',
        email: 'hiker@example.com',
        phone: '555-345-6789',
        isEmailVerified: true,
        isPhoneVerified: true,
        role: 'hiker' as const,
        stripeCustomerId: 'cus_mock123456'
      }
    };
    
    const user = mockUsers[email as keyof typeof mockUsers];
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return { user, error: null };
    }
    
    return { user: null, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: 'Login failed' };
  }
};

// User logout function
export const signOut = async () => {
  localStorage.removeItem('user');
  return { error: null };
};

// Get current session
export const getSession = async () => {
  const storedUser = localStorage.getItem('user');
  
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return { data: { session: { user } }, error: null };
    } catch (error) {
      localStorage.removeItem('user');
      console.error('Failed to parse stored user:', error);
    }
  }
  
  return { data: { session: null }, error: null };
};
