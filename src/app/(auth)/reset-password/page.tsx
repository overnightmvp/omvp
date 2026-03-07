'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
      <p className="text-txt-mid mb-6">
        Enter your email to receive a password reset link
      </p>

      {!success ? (
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

          {error && (
            <div className="bg-accent2/10 border border-accent2/20 rounded-lg p-3">
              <p className="text-accent2 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-bg font-medium py-3 rounded-lg hover:bg-accent/90 transition-smooth disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <div className="bg-accent3/10 border border-accent3/20 rounded-lg p-4">
          <p className="text-accent3 mb-4">
            Password reset link sent! Check your email.
          </p>
        </div>
      )}

      <p className="text-txt-mid text-sm text-center mt-6">
        <Link href="/login" className="text-accent hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
