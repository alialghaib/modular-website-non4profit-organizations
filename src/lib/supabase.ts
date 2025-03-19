
import { createClient } from '@supabase/supabase-js';
import { User } from '@/lib/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase URL or Anon Key is missing! Check your .env file.");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User registration function
export const signUp = async (userData: Partial<User> & { password: string, role: 'admin' | 'guide' | 'hiker' }) => {
  try {
    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email!,
      password: userData.password,
      options: {
        data: {
          role: userData.role,
          email_verified: false,
          first_name: userData.firstName,
          last_name: userData.lastName
        }
      }
    });
    
    if (authError || !authData.user) {
      console.error('Auth signup error:', authError);
      return { user: null, error: authError?.message || 'Signup failed' };
    }
    
    // Create profile record in the profiles table
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: userData.username || '',
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role,
          is_email_verified: false,
          is_phone_verified: false,
          stripe_customer_id: userData.role === 'hiker' ? null : undefined // Will be set later when they make a purchase
        })
        .select()
        .single();
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If the profile creation fails due to RLS, we'll still try to return the user
        // This allows them to login with demo data for testing purposes
        
        // Create a user object from the auth data
        const user: User = {
          id: authData.user.id,
          username: userData.username || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: authData.user.email || '',
          phone: userData.phone,
          isEmailVerified: false,
          isPhoneVerified: false,
          role: userData.role,
          stripeCustomerId: undefined
        };
        
        return { user, error: null };
      }
      
      // If profile was created successfully
      const user: User = {
        id: profileData.id,
        username: profileData.username,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        isEmailVerified: profileData.is_email_verified,
        isPhoneVerified: profileData.is_phone_verified,
        role: profileData.role,
        stripeCustomerId: profileData.stripe_customer_id
      };
      
      return { user, error: null };
    } catch (error) {
      console.error('Profile creation catch error:', error);
      
      // Create a user object from the auth data if profile creation fails
      const user: User = {
        id: authData.user.id,
        username: userData.username || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: authData.user.email || '',
        phone: userData.phone,
        isEmailVerified: false,
        isPhoneVerified: false,
        role: userData.role,
        stripeCustomerId: undefined
      };
      
      return { user, error: null };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { user: null, error: 'Signup failed' };
  }
};

// User login function
export const signIn = async (email: string, password: string) => {
  try {
    console.log(`Attempting to sign in with email: ${email}`);
    
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError || !authData.user) {
      console.error('Login error:', authError);
      return { user: null, error: authError?.message || 'Invalid credentials' };
    }
    
    console.log('Auth successful, checking for user role in metadata:', authData.user);
    
    // First try to get the role from user metadata for demo accounts
    let role = authData.user.user_metadata?.role;
    
    // Hard-coded role assignment for demo accounts
    if (email === 'admin@example.com') {
      role = 'admin';
      console.log('Setting admin role for demo account');
    } else if (email === 'guide@example.com') {
      role = 'guide';
      console.log('Setting guide role for demo account');
    } else if (email === 'hiker@example.com') {
      role = 'hiker';
      console.log('Setting hiker role for demo account');
    }
    
    try {
      // Get the user profile from the profiles table
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      // If profile doesn't exist (which could happen if RLS prevented creation during signup),
      // create a user object from auth data
      if (!profileData || profileError) {
        console.log('Profile fetch failed, using auth data instead:', profileError);
        
        // Use the role we determined above or default to hiker
        const user: User = {
          id: authData.user.id,
          username: email.split('@')[0], // Default username from email
          firstName: authData.user.user_metadata?.first_name || '',
          lastName: authData.user.user_metadata?.last_name || '',
          email: email,
          isEmailVerified: authData.user.email_confirmed_at != null,
          isPhoneVerified: false,
          role: role || 'hiker',
          stripeCustomerId: undefined
        };
        
        console.log('Created user from auth data with role:', user.role);
        return { user, error: null };
      }
      
      // If profile exists but role is missing, use our determined role
      if (!profileData.role && role) {
        profileData.role = role;
      }
      
      // Map profile data to User type
      const user: User = {
        id: profileData.id,
        username: profileData.username || email.split('@')[0],
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        email: profileData.email,
        phone: profileData.phone,
        isEmailVerified: profileData.is_email_verified,
        isPhoneVerified: profileData.is_phone_verified,
        role: profileData.role || role || 'hiker',
        stripeCustomerId: profileData.stripe_customer_id
      };
      
      console.log('Created user from profile data with role:', user.role);
      return { user, error: null };
    } catch (error) {
      console.error('Profile fetch error in catch:', error);
      
      // Use the role we determined above
      const user: User = {
        id: authData.user.id,
        username: email.split('@')[0], // Default username from email
        firstName: authData.user.user_metadata?.first_name || '',
        lastName: authData.user.user_metadata?.last_name || '',
        email: email,
        isEmailVerified: authData.user.email_confirmed_at != null,
        isPhoneVerified: false,
        role: role || 'hiker',
        stripeCustomerId: undefined
      };
      
      console.log('Created user from auth data in catch block with role:', user.role);
      return { user, error: null };
    }
  } catch (error) {
    console.error('Login error in catch:', error);
    return { user: null, error: 'Login failed' };
  }
};

// User logout function
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      return { error: error.message };
    }
    return { error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: 'Logout failed' };
  }
};

// Get current session
export const getSession = async () => {
  try {
    // Get current auth session from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      return { data: { session: null }, error: sessionError };
    }
    
    const authUser = sessionData.session.user;
    console.log('Session found, user metadata:', authUser.user_metadata);
    
    // Hard-coded role determination for demo accounts
    let role = authUser.user_metadata?.role;
    if (authUser.email === 'admin@example.com') {
      role = 'admin';
      console.log('Setting admin role for demo account in session');
    } else if (authUser.email === 'guide@example.com') {
      role = 'guide';
    } else if (authUser.email === 'hiker@example.com') {
      role = 'hiker';
    }
    
    try {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .maybeSingle();
      
      if (profileError || !profileData) {
        console.log('Profile fetch error during session check, using auth data:', profileError);
        
        // Create user object from auth data
        const user: User = {
          id: authUser.id,
          username: authUser.email?.split('@')[0] || '', // Default username from email
          firstName: authUser.user_metadata?.first_name || '',
          lastName: authUser.user_metadata?.last_name || '',
          email: authUser.email || '',
          isEmailVerified: authUser.email_confirmed_at != null,
          isPhoneVerified: false,
          role: role || 'hiker',
          stripeCustomerId: undefined
        };
        
        console.log('Session user created from auth data with role:', user.role);
        return { data: { session: { ...sessionData.session, user } }, error: null };
      }
      
      // If profile exists but role is missing, use our determined role
      if (!profileData.role && role) {
        profileData.role = role;
      }
      
      // Map profile data to User type
      const user: User = {
        id: profileData.id,
        username: profileData.username || authUser.email?.split('@')[0] || '',
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        email: profileData.email,
        phone: profileData.phone,
        isEmailVerified: profileData.is_email_verified,
        isPhoneVerified: profileData.is_phone_verified,
        role: profileData.role || role || 'hiker',
        stripeCustomerId: profileData.stripe_customer_id
      };
      
      console.log('Session user created from profile with role:', user.role);
      
      // Return session with user profile
      return { data: { session: { ...sessionData.session, user } }, error: null };
    } catch (error) {
      console.error('Profile processing error during session check:', error);
      
      // Create user from auth data as fallback
      const user: User = {
        id: authUser.id,
        username: authUser.email?.split('@')[0] || '', // Default username from email
        firstName: authUser.user_metadata?.first_name || '',
        lastName: authUser.user_metadata?.last_name || '',
        email: authUser.email || '',
        isEmailVerified: authUser.email_confirmed_at != null,
        isPhoneVerified: false,
        role: role || 'hiker',
        stripeCustomerId: undefined
      };
      
      console.log('Session user created in catch block with role:', user.role);
      return { data: { session: { ...sessionData.session, user } }, error: null };
    }
  } catch (error) {
    console.error('Get session error:', error);
    return { data: { session: null }, error: 'Failed to get session' };
  }
};
