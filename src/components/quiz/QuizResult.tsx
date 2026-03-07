'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { QuizState } from '@/hooks/useQuizState'
import { calculateAuthorityScore } from '@/lib/quiz/authority-algorithm'
import { getScoreInterpretation } from '@/lib/quiz/score-interpretation'

interface QuizResultProps {
  state: QuizState
}

export function QuizResult({ state }: QuizResultProps) {
  const score = calculateAuthorityScore(state)
  const interpretation = getScoreInterpretation(score)

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-2xl font-bold mb-4">Your Authority Score</h2>

        {/* Score Circle */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="12"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="#E8FF47"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 88 * (1 - score / 100),
              }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-6xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-2">{interpretation.title}</h3>
          <p className="text-txt-mid">{interpretation.description}</p>
        </div>

        {/* ONBOARD-09: Template Selection CTA */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3">
            Choose Your Template Style
          </h3>
          <p className="text-txt-mid text-sm mb-4">
            Your free page will use our default Minimal template. After generation, you can preview other styles and upgrade to unlock all templates.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📄</div>
              <div className="text-xs font-medium">Minimal</div>
              <div className="text-xs text-accent mt-1">Default</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center opacity-50">
              <div className="text-2xl mb-1">📰</div>
              <div className="text-xs font-medium">Editorial</div>
              <div className="text-xs text-txt-faint mt-1">Pro+</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center opacity-50">
              <div className="text-2xl mb-1">🔧</div>
              <div className="text-xs font-medium">Technical</div>
              <div className="text-xs text-txt-faint mt-1">Pro+</div>
            </div>
          </div>
          <p className="text-txt-faint text-xs mt-4 text-center">
            Upgrade to Pro or Authority tier to unlock all templates + customization
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/signup?quiz_completed=true"
          className="inline-block bg-accent text-bg font-medium px-8 py-4 rounded-lg hover:bg-accent/90 transition-smooth"
        >
          Create Account to Get Your Free Page
        </Link>

        <p className="text-txt-mid text-sm mt-4">
          Generate a free SEO page from your most popular video
        </p>
      </motion.div>
    </div>
  )
}
