import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from './auth.store';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,
    });
    mockLocalStorage.clear();
  });

  describe('setAuth', () => {
    it('sets user and accessToken', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: '2024-01-01',
      };

      useAuthStore.getState().setAuth('test-token', user);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.accessToken).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('persists token to localStorage', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: '2024-01-01',
      };

      useAuthStore.getState().setAuth('test-token', user);

      expect(mockLocalStorage.getItem('auth_access_token')).toBe('test-token');
    });
  });

  describe('clearAuth', () => {
    it('clears user and accessToken', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: '2024-01-01',
      };
      useAuthStore.getState().setAuth('test-token', user);

      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('removes token from localStorage', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: '2024-01-01',
      };
      useAuthStore.getState().setAuth('test-token', user);

      useAuthStore.getState().clearAuth();

      expect(mockLocalStorage.getItem('auth_access_token')).toBeNull();
    });
  });

  describe('initializeAuth', () => {
    it('sets isInitialized when no token in localStorage', async () => {
      await useAuthStore.getState().initializeAuth();

      expect(useAuthStore.getState().isInitialized).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('does not reinitialize if already initialized', async () => {
      useAuthStore.setState({ isInitialized: true });
      mockLocalStorage.setItem('auth_access_token', 'old-token');

      await useAuthStore.getState().initializeAuth();

      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it('restores auth state when token exists and user is valid', async () => {
      mockLocalStorage.setItem('auth_access_token', 'mock-token-1');

      vi.mock('@/web/lib/api/auth', () => ({
        getCurrentUser: vi.fn().mockResolvedValue({
          id: '1',
          email: 'alex@example.com',
          displayName: 'Alex',
          createdAt: '2024-01-15T10:00:00Z',
        }),
      }));

      await useAuthStore.getState().initializeAuth();

      expect(useAuthStore.getState().isInitialized).toBe(true);
    });
  });
});
