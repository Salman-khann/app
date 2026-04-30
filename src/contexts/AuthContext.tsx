import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import { toast } from 'sonner';

function normalizeAuthError(error: unknown, action: string) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('over_email_send_rate_limit')) {
      return new Error(
        `Supabase is temporarily rate-limiting signup emails. Try again later, disable email confirmation in Supabase, or use a different test email after the limit resets.`,
      );
    }

    if (message.includes('invalid email')) {
      return new Error('Please enter a valid email address like name@example.com.');
    }

    if (message.includes('failed to fetch') || message.includes('networkerror') || message.includes('load failed')) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      return new Error(
        `Cannot reach Supabase while trying to ${action}. Check that VITE_SUPABASE_URL is correct, the project is active, and your network can resolve ${supabaseUrl}.`,
      );
    }

    return error;
  }

  return new Error(`Unable to ${action}. Please try again.`);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
  return data;
}
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, role: 'user' | 'dermatologist') => Promise<{ error: Error | null; requiresEmailConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    supabase
      .auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id).then(setProfile);
        }
      })
      .catch(error => {
        toast.error(`获取用户信息失败: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });

    // In this function, do NOT use any await calls. Use `.then()` instead to avoid deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: normalizeAuthError(error, 'sign in with email and password') };
    }
  };

  const signUpWithEmail = async (email: string, password: string, role: 'user' | 'dermatologist') => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            role,
          },
        },
      });

      if (error) throw error;

      // Supabase returns no session when email confirmation is required.
      return { error: null, requiresEmailConfirmation: !data.session };
    } catch (error) {
      return { error: normalizeAuthError(error, 'create your account') };
    }
  };

  const signInWithGoogle = async () => {
    const redirectTo = window.location.origin;
    const googleDomain = import.meta.env.VITE_SUPABASE_GOOGLE_DOMAIN?.trim();

    const authResult = googleDomain
      ? await supabase.auth.signInWithSSO({
          domain: googleDomain,
          options: {
            redirectTo,
          },
        })
      : await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
          },
        });

    const { data, error } = authResult;

    if (error) {
      toast.error(`Google sign in failed: ${normalizeAuthError(error, 'sign in with Google').message}`);
    } else if (data?.url) {
      window.location.assign(data.url);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, refreshProfile }}>
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
