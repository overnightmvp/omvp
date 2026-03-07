import { AuthForm } from '@/components/auth/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Authority Platform',
  description: 'Create your account to start building authority',
}

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  return <AuthForm mode="signup" />
}
