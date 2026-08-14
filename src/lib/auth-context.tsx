import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, UserRole, PermissionMatrix, getRolePermissions, CreateUserData } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  permissions: PermissionMatrix;
  isLoading: boolean;
  isConfigured: boolean;
  isSessionExpired: boolean;
  setSimulatedRole: (role: UserRole) => void;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null; user?: UserProfile }>;
  signUpWithPassword: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null; message?: string }>;
  updateUserPassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateUserProfile: (data: { full_name?: string; phone?: string | null }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  simulateSessionTimeout: () => void;
  clearSessionExpired: () => void;
  // User Management Methods (Admin Only)
  fetchUsersList: () => Promise<{ users: UserProfile[]; error: Error | null }>;
  createUserAdmin: (userData: CreateUserData) => Promise<{ user?: UserProfile; error: Error | null }>;
  updateUserAdmin: (id: string, updates: Partial<UserProfile>) => Promise<{ user?: UserProfile; error: Error | null }>;
  toggleUserStatusAdmin: (id: string, currentStatus: boolean) => Promise<{ success: boolean; error: Error | null }>;
  loginAsDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial fallback accounts for testing
const DEMO_USERS: Record<UserRole, UserProfile> = {
  ADMIN: {
    id: 'usr_admin_master',
    email: 'admin@dualsystem.com',
    full_name: 'Administrador Master',
    phone: '(11) 98765-4321',
    role: 'ADMIN',
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    last_login: new Date().toISOString(),
  },
  SELLER: {
    id: 'usr_seller_carlos',
    email: 'carlos.vendas@dualsystem.com',
    full_name: 'Carlos Silva (Vendedor)',
    phone: '(11) 97654-3210',
    role: 'SELLER',
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    last_login: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    // Default initial mock logged-in state so system is instantly testable
    return DEMO_USERS.ADMIN;
  });
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  // Fetch or build user profile from Supabase
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      if (!isSupabaseConfigured) {
        return;
      }

      // Query profiles table with role
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          is_active,
          created_at,
          roles ( name )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Erro ao buscar perfil do usuário no Supabase:', error.message);
      }

      if (data) {
        const profileData = data as unknown as {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          roles: { name: UserRole } | null;
        };
        const roleName: UserRole = profileData.roles?.name === 'SELLER' ? 'SELLER' : 'ADMIN';
        
        const userProf: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          phone: profileData.phone,
          role: roleName,
          is_active: profileData.is_active,
          created_at: profileData.created_at,
          last_login: new Date().toISOString(),
        };
        setProfile(userProf);
        setActiveRole(roleName);
      } else {
        const defaultProf: UserProfile = {
          id: userId,
          email: userEmail,
          full_name: userEmail.split('@')[0] || 'Administrador',
          phone: null,
          role: activeRole,
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };
        setProfile(defaultProf);
      }
    } catch (err) {
      console.error('Falha ao processar perfil do usuário:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Check current Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_OUT') {
        setProfile(null);
      } else if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      setIsSessionExpired(false);

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          await fetchUserProfile(data.user.id, data.user.email || email);
        }
        return { error: null };
      }

      // Demo/Offline Fallback Authentication
      const isSeller = email.toLowerCase().includes('venda') || email.toLowerCase().includes('carlos') || email.toLowerCase().includes('seller');
      const targetRole: UserRole = isSeller ? 'SELLER' : 'ADMIN';
      const mockProfile: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        full_name: email.split('@')[0] ? email.split('@')[0].toUpperCase() : 'Usuário Logado',
        phone: '(11) 98765-0000',
        role: targetRole,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      setProfile(mockProfile);
      setActiveRole(targetRole);
      return { error: null, user: mockProfile };
    } catch (err: unknown) {
      const error = err as Error;
      return { error };
    }
  };

  const signUpWithPassword = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role_name: role,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          await fetchUserProfile(data.user.id, email);
        }

        return { error: null };
      }

      // Fallback offline signup
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        full_name: fullName,
        phone: null,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      setProfile(newUser);
      setActiveRole(role);
      return { error: null };
    } catch (err: unknown) {
      const error = err as Error;
      return { error };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        return { error: null, message: 'Link de recuperação de senha enviado com sucesso!' };
      }

      // Simulated success for preview/demo
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        error: null,
        message: `Instruções de redefinição de senha foram enviadas com sucesso para ${email}.`,
      };
    } catch (err: unknown) {
      const error = err as Error;
      return { error };
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      return { error: null };
    } catch (err: unknown) {
      const error = err as Error;
      return { error };
    }
  };

  const updateUserProfile = async (data: { full_name?: string; phone?: string | null }) => {
    try {
      if (profile) {
        const updated = {
          ...profile,
          full_name: data.full_name ?? profile.full_name,
          phone: data.phone !== undefined ? data.phone : profile.phone,
        };
        setProfile(updated);

        if (isSupabaseConfigured && profile.id) {
          await (supabase
            .from('profiles') as any)
            .update({
              full_name: updated.full_name,
              phone: updated.phone,
            })
            .eq('id', profile.id);
        }
      }
      return { error: null };
    } catch (err: unknown) {
      const error = err as Error;
      return { error };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsSessionExpired(false);
    } catch (err) {
      console.error('Erro ao deslogar:', err);
      setProfile(null);
    }
  };

  const simulateSessionTimeout = () => {
    setIsSessionExpired(true);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const clearSessionExpired = () => {
    setIsSessionExpired(false);
  };

  const loginAsDemoUser = (targetRole: UserRole) => {
    const demo = DEMO_USERS[targetRole];
    setProfile(demo);
    setActiveRole(targetRole);
    setIsSessionExpired(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id, user.email || '');
    }
  };

  const setSimulatedRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (profile) {
      setProfile({
        ...profile,
        role: newRole,
      });
    }
  };

  // --- Administrative User Management Methods ---

  const fetchUsersList = async (): Promise<{ users: UserProfile[]; error: Error | null }> => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'x-user-role': activeRole,
          'x-user-id': profile?.id || 'demo-user',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${response.status}: Falha ao buscar usuários`);
      }

      const result = await response.json();
      return { users: result.users || [], error: null };
    } catch (err: unknown) {
      return { users: [], error: err as Error };
    }
  };

  const createUserAdmin = async (userData: CreateUserData): Promise<{ user?: UserProfile; error: Error | null }> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeRole,
          'x-user-id': profile?.id || 'demo-user',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${response.status}: Falha ao criar usuário`);
      }

      const result = await response.json();
      return { user: result.user, error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const updateUserAdmin = async (id: string, updates: Partial<UserProfile>): Promise<{ user?: UserProfile; error: Error | null }> => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeRole,
          'x-user-id': profile?.id || 'demo-user',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${response.status}: Falha ao atualizar usuário`);
      }

      const result = await response.json();
      return { user: result.user, error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const toggleUserStatusAdmin = async (id: string, currentStatus: boolean): Promise<{ success: boolean; error: Error | null }> => {
    return updateUserAdmin(id, { is_active: !currentStatus }).then((res) => ({
      success: !res.error,
      error: res.error,
    }));
  };

  const permissions = getRolePermissions(activeRole);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: activeRole,
        permissions,
        isLoading,
        isConfigured: isSupabaseConfigured,
        isSessionExpired,
        setSimulatedRole,
        signInWithPassword,
        signUpWithPassword,
        resetPasswordForEmail,
        updateUserPassword,
        updateUserProfile,
        signOut,
        refreshProfile,
        simulateSessionTimeout,
        clearSessionExpired,
        fetchUsersList,
        createUserAdmin,
        updateUserAdmin,
        toggleUserStatusAdmin,
        loginAsDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
