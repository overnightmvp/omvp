'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface QueueItem {
  id: string
  video_title: string
  video_url: string
  status: string
  queued_at: string
  error_message?: string
}

interface QueueStatusData {
  currentItem: QueueItem | null
  queuePosition: number
  estimatedTime: string
  totalPending: number
}

export function GenerationQueueStatus() {
  const [data, setData] = useState<QueueStatusData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/generation/status')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching queue status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-txt-mid">Loading queue status...</p>
      </div>
    )
  }

  if (!data?.currentItem) {
    return null
  }

  const { currentItem, queuePosition, estimatedTime } = data

  return (
    <motion.div
      className="bg-card border border-border rounded-lg p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {currentItem.status === 'pending' && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Page Generation Queued
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-txt-mid text-sm mb-1">Generating page from:</p>
              <p className="font-medium">{currentItem.video_title}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-txt-mid">Queue position:</span>
              <span className="font-medium text-accent">#{queuePosition}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-txt-mid">Estimated time:</span>
              <span className="font-medium">{estimatedTime}</span>
            </div>
            <div className="bg-surface rounded-lg p-4 mt-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-3"></div>
                <p className="text-txt-mid text-sm">
                  You'll receive an email when your page is ready
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {currentItem.status === 'processing' && (
        <>
          <h2 className="text-xl font-semibold mb-4">Generating Your Page</h2>
          <div className="space-y-3">
            <div>
              <p className="text-txt-mid text-sm mb-1">Creating page from:</p>
              <p className="font-medium">{currentItem.video_title}</p>
            </div>
            <div className="bg-surface rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-3"></div>
                <p className="text-txt-mid text-sm">
                  Generating SEO-optimized content...
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {currentItem.status === 'failed' && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-accent2">
            Generation Failed
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-txt-mid text-sm mb-1">Failed to generate:</p>
              <p className="font-medium">{currentItem.video_title}</p>
            </div>
            {currentItem.error_message && (
              <div className="bg-accent2/10 border border-accent2/20 rounded-lg p-3">
                <p className="text-accent2 text-sm">
                  {currentItem.error_message}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-accent text-bg font-medium py-3 rounded-lg hover:bg-accent/90 transition-smooth"
            >
              Try Again
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}