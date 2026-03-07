import { AuthForm } from '@/components/auth/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In | Authority Platform',
  description: 'Log in to your account',
}

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return <AuthForm mode="login" />
}
