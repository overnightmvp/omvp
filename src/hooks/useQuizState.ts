'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'

// Zod schema for localStorage validation (prevent crashes from malformed data)
const QuizStateSchema = z.object({
  currentStep: z.number().int().min(0).max(10),
  name: z.string().optional(),
  handle: z.string().optional(),
  primaryPlatform: z
    .enum(['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter', 'podcast'])
    .optional(),
  secondaryChannels: z.array(z.string()).default([]),
  niche: z.string().optional(),
  nicheCategory: z.string().optional(),
  offers: z.array(z.string()).default([]),
  googlePresence: z.enum(['page1', 'exists', 'dontknow', 'none']).optional(),
  aiPresence: z.enum(['mentioned', 'others', 'untested', 'none']).optional(),
  websiteStatus: z.enum(['yes_good', 'yes_basic', 'no']).optional(),
  brandTones: z.array(z.string()).default([]),
  antiVision: z.array(z.string()).default([]),
  antiCustom: z.string().optional(),
  blocker: z.string().optional(),
  timeline: z.enum(['now', 'month', 'quarter', 'planning']).optional(),
  context: z.string().optional(),
  completedAt: z.string().optional(),
})

export type QuizState = z.infer<typeof QuizStateSchema>

const initialState: QuizState = {
  currentStep: 0,
  secondaryChannels: [],
  offers: [],
  brandTones: [],
  antiVision: [],
}

const STORAGE_KEY = 'quiz_state_v1'

export function useQuizState() {
  const [state, setState] = useState<QuizState>(() => {
    // Lazy initialization from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          const validated = QuizStateSchema.safeParse(parsed)
          if (validated.success) {
            return validated.data
          } else {
            console.warn('Invalid quiz state in localStorage, using initial state')
          }
        }
      } catch (error) {
        console.error('Error loading quiz state:', error)
      }
    }
    return initialState
  })

  // Auto-save to localStorage on state change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('Error saving quiz state:', error)
      }
    }
  }, [state])

  const updateState = (updates: Partial<QuizState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }))
  }

  const prevStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }))
  }

  const resetQuiz = () => {
    setState(initialState)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return { state, updateState, nextStep, prevStep, resetQuiz }
}
