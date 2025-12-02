export type User = {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: User;
};

export type SignupRequest = {
  email: string;
  password: string;
  displayName?: string;
  acceptedTerms: boolean;
};

export type SignupResponse = {
  accessToken: string;
  user: User;
};

export type AuthError = {
  message: string;
  code: 'INVALID_CREDENTIALS' | 'EMAIL_EXISTS' | 'VALIDATION_ERROR';
};
