import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  _hasHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,

      login: (token, user) => {
        set({ token, user });
      },

      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: 'tprm-auth',
      storage: createJSONStorage(() => localStorage),
      // Don't persist the hydration flag
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => {
        // Called when rehydration starts
        return (state, error) => {
          // Called when rehydration finishes (with or without error)
          if (state) {
            state._hasHydrated = true;
            // Force a re-render by setting state
            useAuthStore.setState({ _hasHydrated: true });
          }
        };
      },
    }
  )
);

// Also set hydrated immediately after store creation (fallback)
// This handles the case where storage is empty
if (typeof window !== 'undefined') {
  // Small delay to ensure persist middleware has initialized
  setTimeout(() => {
    const state = useAuthStore.getState();
    if (!state._hasHydrated) {
      useAuthStore.setState({ _hasHydrated: true });
    }
  }, 0);
}

// Helper to check if user is authenticated (both token AND user exist)
export const isAuthenticated = () => {
  const state = useAuthStore.getState();
  return !!(state.token && state.user);
};
