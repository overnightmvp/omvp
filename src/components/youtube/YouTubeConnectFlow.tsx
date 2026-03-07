'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

export function YouTubeConnectFlow() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for error from URL params (after OAuth failure)
  const urlError = searchParams.get('error')

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/youtube/connect')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate YouTube connection')
      }

      // Redirect to Google OAuth consent screen
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-accent"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Connect Your YouTube</h1>
            <p className="text-txt-mid">
              We need access to your channel to generate your free SEO page
            </p>
          </div>

          {(error || urlError) && (
            <motion.div
              className="bg-accent2/10 border border-accent2/20 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-accent2 text-sm mb-3">
                {error || urlError}
              </p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-accent2 text-white font-medium py-2 rounded-lg hover:bg-accent2/90 transition-smooth disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Try Again'}
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-accent text-bg font-medium py-4 rounded-lg hover:bg-accent/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect YouTube Channel'
              )}
            </button>

            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full py-4 border border-border hover:border-border-md rounded-lg transition-smooth disabled:opacity-50"
            >
              Skip for Now
            </button>
          </div>

          <div className="mt-6 bg-surface rounded-lg p-4">
            <p className="text-txt-mid text-sm mb-2">
              <strong>What we need:</strong>
            </p>
            <ul className="text-txt-mid text-sm space-y-1">
              <li>• Read-only access to your channel</li>
              <li>• Video list and metadata</li>
              <li>• View counts (to find most popular video)</li>
            </ul>
            <p className="text-txt-faint text-xs mt-3">
              We will never post, comment, or modify your channel
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}