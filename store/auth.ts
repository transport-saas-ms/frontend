import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserPermissions } from '@/lib/types/index';
import { setCookie, deleteCookie } from '@/lib/cookies';

interface AuthState {
  user: User | null;
  permissions: UserPermissions | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (tokens: { accessToken: string; refreshToken: string; userId: string; role: string }) => void;
  setUserProfile: (user: User, permissions: UserPermissions) => void;
  logout: () => void;
  forceLogout: () => void; // Nueva función para logout forzado por expiración
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (tokens: { accessToken: string; refreshToken: string; userId: string; role: string }) => {
        // Guardar tokens en localStorage y cookies
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', tokens.accessToken);
          localStorage.setItem('refresh-token', tokens.refreshToken);
          setCookie('auth-token', tokens.accessToken, 7); // 7 días
        }
        set({ 
          token: tokens.accessToken, 
          refreshToken: tokens.refreshToken, 
          isAuthenticated: true 
        });
      },
      setUserProfile: (user: User, permissions: UserPermissions) => {
        // Guardar perfil completo del usuario
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-user', JSON.stringify(user));
          localStorage.setItem('auth-permissions', JSON.stringify(permissions));
        }
        set({ user, permissions });
      },
      logout: () => {
        // Limpiar localStorage y cookies
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
          localStorage.removeItem('auth-user');
          localStorage.removeItem('auth-permissions');
          deleteCookie('auth-token');
        }
        set({ 
          user: null, 
          permissions: null, 
          token: null, 
          refreshToken: null, 
          isAuthenticated: false 
        });
      },
      forceLogout: () => {
        // Logout silencioso por expiración de token - no mostrar toasts
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
          localStorage.removeItem('auth-user');
          localStorage.removeItem('auth-permissions');
          deleteCookie('auth-token');
        }
        set({ 
          user: null, 
          permissions: null, 
          token: null, 
          refreshToken: null, 
          isAuthenticated: false 
        });
      },
      updateUser: (updatedUser: Partial<User>) => {
        const { user } = get();
        if (user) {
          const newUser = { ...user, ...updatedUser };
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth-user', JSON.stringify(newUser));
          }
          set({ user: newUser });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
