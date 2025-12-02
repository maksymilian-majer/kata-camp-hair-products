import { describe, expect, it } from 'vitest';

import { loginSchema, passwordSchema, signupSchema } from './auth.schemas';

describe('passwordSchema', () => {
  it('accepts valid password with all requirements', () => {
    const result = passwordSchema.safeParse('SecurePass1!');
    expect(result.success).toBe(true);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('Short1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Password must be at least 8 characters'
      );
    }
  });

  it('rejects password without uppercase letter', () => {
    const result = passwordSchema.safeParse('lowercase1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Password must contain an uppercase letter'
      );
    }
  });

  it('rejects password without number', () => {
    const result = passwordSchema.safeParse('NoNumberHere!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Password must contain a number'
      );
    }
  });

  it('rejects password without special character', () => {
    const result = passwordSchema.safeParse('NoSpecial1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Password must contain a special character'
      );
    }
  });
});

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'alex@example.com',
      password: 'anypassword',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'alex@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('signupSchema', () => {
  const validSignupData = {
    email: 'alex@example.com',
    password: 'SecurePass1!',
    confirmPassword: 'SecurePass1!',
    acceptedTerms: true,
  };

  it('accepts valid signup data', () => {
    const result = signupSchema.safeParse(validSignupData);
    expect(result.success).toBe(true);
  });

  it('accepts signup data with optional displayName', () => {
    const result = signupSchema.safeParse({
      ...validSignupData,
      displayName: 'Alex',
    });
    expect(result.success).toBe(true);
  });

  it('validates password complexity', () => {
    const result = signupSchema.safeParse({
      ...validSignupData,
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find(
        (i) => i.path[0] === 'password'
      );
      expect(passwordError).toBeDefined();
    }
  });

  it('rejects mismatched password confirmation', () => {
    const result = signupSchema.safeParse({
      ...validSignupData,
      password: 'SecurePass1!',
      confirmPassword: 'DifferentPass1!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path[0] === 'confirmPassword'
      );
      expect(confirmError?.message).toBe('Passwords do not match');
    }
  });

  it('rejects when terms not accepted', () => {
    const result = signupSchema.safeParse({
      ...validSignupData,
      acceptedTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = signupSchema.safeParse({
      ...validSignupData,
      email: 'invalid-email',
    });
    expect(result.success).toBe(false);
  });
});
