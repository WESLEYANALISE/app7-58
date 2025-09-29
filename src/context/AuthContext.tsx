import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type ProfileType = 'faculdade' | 'concurso' | 'oab' | 'advogado';

interface UserProfile {
  id: string;
  nome_completo?: string;
  email: string;
  telefone?: string;
  profile_type?: ProfileType;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, profileType: ProfileType) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | { message: string; originalError?: any } | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { nome_completo?: string; email?: string }) => Promise<{ error: any | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile using raw queries to avoid type recursion
  const fetchProfile = async (userId: string) => {
    try {
      // First try to get the profile
      const profileResult = await (supabase as any)
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();

      const settingsResult = await (supabase as any)
        .from('user_settings')
        .select('profile_type')
        .eq('id', userId)
        .single();

      const profileData = profileResult.data;
      const settingsData = settingsResult.data;

      if (profileData) {
        const profileType = settingsData?.profile_type;
        const validProfileType = (profileType === 'faculdade' || profileType === 'concurso' || 
                                 profileType === 'oab' || profileType === 'advogado') ? 
                                 profileType as ProfileType : undefined;

        setProfile({
          id: profileData.id,
          nome_completo: profileData.nome_completo,
          email: profileData.email,
          profile_type: validProfileType
        });
      } else {
        // Profile doesn't exist, create it
        await createMissingProfile(userId);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      // Try to create profile if it doesn't exist
      try {
        await createMissingProfile(userId);
      } catch (createError) {
        console.error('Erro ao criar perfil:', createError);
        // Set basic profile as fallback
        setBasicProfile(userId);
      }
    }
  };

  // Create missing profile from auth data
  const createMissingProfile = async (userId: string) => {
    if (!user) return;

    const nome_completo = user.user_metadata?.nome_completo || 
                         user.email?.split('@')[0] || 
                         'Usuário';

    // Insert profile
    const { error: profileError } = await (supabase as any)
      .from('perfis')
      .insert({
        id: userId,
        nome_completo,
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Erro ao inserir perfil:', profileError);
      throw profileError;
    }

    // Set the profile state
    setProfile({
      id: userId,
      nome_completo,
      email: user.email || '',
      profile_type: user.user_metadata?.profile_type as ProfileType
    });
  };

  // Set basic profile as fallback
  const setBasicProfile = (userId: string) => {
    const nome_completo = user?.user_metadata?.nome_completo || 
                         user?.email?.split('@')[0] || 
                         'Usuário';
    
    setProfile({
      id: userId,
      nome_completo,
      email: user?.email || '',
      profile_type: user?.user_metadata?.profile_type as ProfileType
    });
  };

  useEffect(() => {
    let mounted = true;

    // Set up proper authentication state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile loading to avoid blocking auth state
          setTimeout(() => {
            if (mounted) fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, profileType: ProfileType) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome_completo: fullName,
            profile_type: profileType
          }
        }
      });

      // Don't throw error on server issues - let user complete signup
      if (error) {
        console.warn('Aviso no signUp:', error);
        // Only return error if it's a client-side validation error
        if (error.message.includes('invalid') || error.message.includes('password') || error.message.includes('email')) {
          return { error };
        }
      }

      return { error: null };
    } catch (error) {
      console.warn('Aviso inesperado no signUp:', error);
      // Don't fail the signup for server errors
      return { error: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando login com:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('Erro de login detalhado:', {
          message: error.message,
          status: error.status,
          name: error.name
        });

        // Tratamento específico para diferentes tipos de erro
        if (error.message.includes('Invalid login credentials')) {
          // Verificar se o usuário existe nos perfis
          try {
            const { data: profile } = await (supabase as any)
              .from('perfis')
              .select('*')
              .eq('email', email.trim().toLowerCase())
              .single();

            if (profile) {
              console.warn('Usuário existe nos perfis mas falha no auth. Possível problema de sincronização.');
              return { 
                error: { 
                  message: 'Problema de sincronização. Entre em contato com o suporte.',
                  originalError: error
                } 
              };
            }
          } catch (profileError) {
            console.error('Erro ao verificar perfil:', profileError);
          }
        }
      } else {
        console.log('Login bem-sucedido:', { userId: data.user?.id });
      }

      return { error };
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      return { 
        error: { 
          message: 'Erro inesperado. Tente novamente.',
          originalError: error
        } 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (data: { nome_completo?: string; email?: string }) => {
    try {
      // Since authentication is removed, we'll update the first available profile
      // or create one if none exists
      let profileId = profile?.id;
      
      if (!profileId) {
        // Try to get the first existing profile
        const { data: existingProfiles } = await (supabase as any)
          .from('perfis')
          .select('id')
          .limit(1);
        
        if (existingProfiles && existingProfiles.length > 0) {
          profileId = existingProfiles[0].id;
        } else {
          // Create a new profile if none exists
          const { data: newProfile, error: createError } = await (supabase as any)
            .from('perfis')
            .insert({
              nome_completo: data.nome_completo || 'Usuário',
              email: data.email || 'user@app.com',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            return { error: 'Erro ao criar perfil' };
          }
          
          setProfile({
            id: newProfile.id,
            nome_completo: newProfile.nome_completo,
            email: newProfile.email
          });
          
          return { error: null };
        }
      }

      // Prepare update data
      const updateData: any = { updated_at: new Date().toISOString() };
      if (data.nome_completo) updateData.nome_completo = data.nome_completo;
      if (data.email) updateData.email = data.email;

      const { error } = await (supabase as any)
        .from('perfis')
        .update(updateData)
        .eq('id', profileId);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { error: 'Erro ao atualizar perfil' };
      }

      // Update local profile state
      setProfile(prev => prev ? { 
        ...prev, 
        ...(data.nome_completo && { nome_completo: data.nome_completo }),
        ...(data.email && { email: data.email })
      } : null);
      
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado ao atualizar perfil:', error);
      return { error: 'Erro inesperado ao atualizar perfil' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      return { error };
    } catch (error) {
      console.error('Erro inesperado no resetPassword:', error);
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      return { error };
    } catch (error) {
      console.error('Erro inesperado no updatePassword:', error);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,  
    signOut,
    updateProfile,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};