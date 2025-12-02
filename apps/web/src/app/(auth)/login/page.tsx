import type { Metadata } from 'next';

import { LoginForm } from '@/web/components/auth';

export const metadata: Metadata = {
  title: 'Log In - Hairminator',
  description: 'Log in to your Hairminator account',
};

export default function LoginPage() {
  return <LoginForm />;
}
