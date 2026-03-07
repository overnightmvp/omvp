'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AuthFormProps {
  mode: 'signup' | 'login'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        })

        if (error) throw error

        setSuccess(
          'Account created! Please check your email for verification link.'
        )
        // Redirect to YouTube connect after 2 seconds
        setTimeout(() => {
          router.push('/youtube-connect')
          router.refresh()
        }, 2000)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-2">
        {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p className="text-txt-mid mb-6">
        {mode === 'signup'
          ? 'Sign up to start building your authority'
          : 'Log in to your account'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-smooth"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-smooth"
            placeholder="••••••••"
          />
        </div>

        {mode === 'login' && (
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-sm text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {error && (
          <div className="bg-accent2/10 border border-accent2/20 rounded-lg p-3">
            <p className="text-accent2 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-accent3/10 border border-accent3/20 rounded-lg p-3">
            <p className="text-accent3 text-sm">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-bg font-medium py-3 rounded-lg hover:bg-accent/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Processing...'
            : mode === 'signup'
            ? 'Create Account'
            : 'Log In'}
        </button>
      </form>

      <p className="text-txt-mid text-sm text-center mt-6">
        {mode === 'signup' ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
