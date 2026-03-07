'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface QuizStepProps {
  step: number
  isActive: boolean
  children: React.ReactNode
}

export function QuizStep({ step, isActive, children }: QuizStepProps) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1], // Matches quiz cubic-bezier
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
