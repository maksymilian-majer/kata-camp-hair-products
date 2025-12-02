import type { Metadata } from 'next';

import { SignupForm } from '@/web/components/auth';

export const metadata: Metadata = {
  title: 'Sign Up - Hairminator',
  description: 'Create your Hairminator account',
};

export default function SignupPage() {
  return <SignupForm />;
}
