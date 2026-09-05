import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile, UserRole } from '../types';
import { getSupabase, isSupabaseConfigured } from '../config/supabase';
import { fetchProfile, upsertProfile } from '../services/profileService';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: UserRole }>;
  signUp: (email: string, password: string, fullName: string, phone: string, role?: UserRole) => Promise<{ error?: string; role?: UserRole }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateCurrentUserProfile: (data: Partial<Profile>) => Promise<void>;
}

const LOCAL_PROFILE_KEY = 'caram_active_user_profile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize real auth state from Supabase
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const client = getSupabase();
      if (client && isSupabaseConfigured) {
        try {
          const { data: { session: currentSession }, error: sessionError } = await client.auth.getSession();
          
          if (sessionError) {
            console.error('Error al recuperar sesión de Supabase:', sessionError.message);
          }

          if (currentSession?.user && isMounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            const userProfile = await fetchProfile(currentSession.user.id);
            if (userProfile) {
              setProfile(userProfile);
              localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(userProfile));
            } else {
              // Create default profile in Supabase table
              const defaultProf: Profile = {
                id: currentSession.user.id,
                email: currentSession.user.email,
                full_name: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0] || 'Cliente',
                phone: currentSession.user.user_metadata?.phone || '',
                role: (currentSession.user.user_metadata?.role as UserRole) || 'customer',
                created_at: new Date().toISOString(),
              };
              setProfile(defaultProf);
              await upsertProfile(defaultProf);
              localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaultProf));
            }
          } else if (isMounted) {
            setUser(null);
            setProfile(null);
            setSession(null);
            localStorage.removeItem(LOCAL_PROFILE_KEY);
          }
        } catch (e) {
          console.error('Error en inicialización de autenticación:', e);
        }

        // Realtime auth state listener
        try {
          const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, newSession) => {
            if (!isMounted) return;
            setSession(newSession);
            setUser(newSession?.user || null);

            if (newSession?.user) {
              const p = await fetchProfile(newSession.user.id);
              const realProfile = p || {
                id: newSession.user.id,
                email: newSession.user.email,
                role: (newSession.user.user_metadata?.role as UserRole) || 'customer',
                full_name: newSession.user.user_metadata?.full_name || newSession.user.email?.split('@')[0] || 'Usuario',
                phone: newSession.user.user_metadata?.phone || '',
                created_at: new Date().toISOString(),
              };
              setProfile(realProfile);
              localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(realProfile));
            } else {
              setProfile(null);
              localStorage.removeItem(LOCAL_PROFILE_KEY);
            }
          });

          if (isMounted) setIsLoading(false);
          return () => {
            subscription.unsubscribe();
          };
        } catch (e) {
          console.error('Error suscribiendo a cambios de autenticación:', e);
        }
      } else {
        // Supabase not configured in env
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setSession(null);
          setIsLoading(false);
        }
      }
      if (isMounted) setIsLoading(false);
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const role: UserRole = profile?.role || 'customer';

  const signIn = async (email: string, password: string): Promise<{ error?: string; role?: UserRole }> => {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured) {
      return { error: 'Supabase no está configurado con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en las variables de entorno.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        let userProfile = await fetchProfile(data.user.id);
        const userRole = userProfile?.role || (data.user.user_metadata?.role as UserRole) || 'customer';
        
        if (!userProfile) {
          userProfile = {
            id: data.user.id,
            email: data.user.email,
            role: userRole,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuario',
            phone: data.user.user_metadata?.phone || '',
            created_at: new Date().toISOString(),
          };
          await upsertProfile(userProfile);
        }
        
        setProfile(userProfile);
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(userProfile));
        return { role: userRole };
      }
      return { error: 'No se pudo obtener el usuario autenticado.' };
    } catch (err: any) {
      console.error('Error en signIn:', err);
      return { error: err.message || 'Error al iniciar sesión con Supabase' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    requestedRole: UserRole = 'customer'
  ): Promise<{ error?: string; role?: UserRole }> => {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured) {
      return { error: 'Supabase no está configurado con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.' };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            role: requestedRole,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: requestedRole,
          created_at: new Date().toISOString(),
        };
        await upsertProfile(newProfile);
        setProfile(newProfile);
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));
        return { role: requestedRole };
      }

      return { error: 'Registro completado. Por favor verifica tu correo electrónico si la confirmación está activada.' };
    } catch (err: any) {
      console.error('Error en signUp:', err);
      return { error: err.message || 'Error al registrar usuario en Supabase' };
    }
  };

  const signOut = async () => {
    const client = getSupabase();
    if (client && isSupabaseConfigured) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.error('Error en Supabase signOut:', e);
      }
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem(LOCAL_PROFILE_KEY);
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    const client = getSupabase();
    if (client && isSupabaseConfigured) {
      try {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });
        if (error) return { error: error.message };
      } catch (e: any) {
        return { error: e.message || 'Error al solicitar restablecimiento de contraseña' };
      }
    }
    return {};
  };

  const updateCurrentUserProfile = async (data: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data, updated_at: new Date().toISOString() };
    await upsertProfile(updated);
    setProfile(updated);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        role,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

