import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ENABLE_AUTH } from '@/config/flags';

interface Profile {
  id: string;
  email: string | null;
  is_paid: boolean;
  free_uses_remaining: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null | undefined;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [loading, setLoading] = useState(ENABLE_AUTH);

  const fetchProfile = async (userId: string, userEmail?: string | null) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
      return;
    }

    // Profile not found — create it automatically
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, email: userEmail ?? null, is_paid: false, free_uses_remaining: 2 },
        { onConflict: 'id' }
      )
      .select()
      .single();

    setProfile(newProfile ?? null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    // Skip all auth initialization when auth is disabled
    if (!ENABLE_AUTH) return;

    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setLoading(true);
          setTimeout(async () => {
            if (mounted) {
              await fetchProfile(session.user.id, session.user.email);
              if (mounted) setLoading(false);
            }
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: redirectUrl },
    });
    return { data, error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const savedState = sessionStorage.getItem('confirmState');
    const redirectPath = savedState ? '/results' : '/home';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${redirectPath}` },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
