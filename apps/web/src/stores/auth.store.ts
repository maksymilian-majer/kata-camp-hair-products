'use client';

import { create } from 'zustand';

import type { User } from '@hair-product-scanner/shared';
import { getCurrentUser } from '@/web/lib/api/auth';

const ACCESS_TOKEN_KEY = 'auth_access_token';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (accessToken: string, user: User) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (accessToken: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    set({
      accessToken,
      user,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  initializeAuth: async () => {
    if (get().isInitialized) return;

    if (typeof window === 'undefined') {
      set({ isInitialized: true });
      return;
    }

    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!storedToken) {
      set({ isInitialized: true });
      return;
    }

    try {
      const user = await getCurrentUser();
      if (user) {
        set({
          accessToken: storedToken,
          user,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        set({ isInitialized: true });
      }
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      set({ isInitialized: true });
    }
  },
}));
