import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  LoginRequest,
  SignupRequest,
  User,
} from '@hair-product-scanner/shared';
import { getCurrentUser, login, logout, signup } from '@/web/lib/api/auth';

const USER_QUERY_KEY = ['auth', 'user'] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      queryClient.setQueryData<User>(USER_QUERY_KEY, response.user);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: (response) => {
      queryClient.setQueryData<User>(USER_QUERY_KEY, response.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(USER_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
}
