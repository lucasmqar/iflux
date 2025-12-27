import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'company' | 'driver';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: AppRole | null;
  createdAt: Date;
}

interface Credits {
  userId: string;
  validUntil: Date;
}

interface AuthContextType {
  user: UserProfile | null;
  credits: Credits | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCredits: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, phone?: string, role?: AppRole) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and role
  const fetchUserData = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
      }

      // Fetch credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (creditsError && creditsError.code !== 'PGRST116') {
        console.error('Error fetching credits:', creditsError);
      }

      if (creditsData) {
        setCredits({
          userId: creditsData.user_id,
          validUntil: new Date(creditsData.valid_until),
        });
      } else {
        setCredits(null);
      }

      if (profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: roleData?.role as AppRole | null,
          createdAt: new Date(profile.created_at),
        };
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(async () => {
            const userData = await fetchUserData(session.user);
            setUser(userData);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setCredits(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user).then((userData) => {
          setUser(userData);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou senha incorretos' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    name: string, 
    phone?: string,
    role: AppRole = 'company'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            phone,
            role, // Pass role in metadata for trigger to pick up
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'Este email já está cadastrado' };
        }
        return { success: false, error: error.message };
      }

      // Role is now automatically assigned by the handle_new_user_role trigger
      // based on the role passed in user metadata

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta' };
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/completar-perfil`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login com Google' };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(null);
    setSession(null);
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Admin has unlimited access - no credits required
  const isAdmin = user?.role === 'admin';
  const hasCreditsActive = isAdmin || (credits ? new Date(credits.validUntil) > new Date() : false);

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        isAuthenticated: !!session && !!user,
        isLoading,
        hasCredits: hasCreditsActive,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateUser,
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
