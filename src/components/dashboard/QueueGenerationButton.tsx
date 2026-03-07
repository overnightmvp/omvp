'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function QueueGenerationButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleQueue = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generation/queue', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to queue generation')
      }

      router.push('/generating')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleQueue}
        disabled={loading}
        className="bg-accent text-bg font-medium px-6 py-3 rounded-lg hover:bg-accent/90 transition-smooth disabled:opacity-50"
      >
        {loading ? 'Queueing...' : 'Generate Free Page'}
      </button>
      {error && (
        <p className="text-accent2 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}