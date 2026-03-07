'use client'

import { motion } from 'framer-motion'

interface CardOptionProps {
  id: string
  label: string
  description?: string
  selected: boolean
  onClick: (id: string) => void
}

export function CardOption({
  id,
  label,
  description,
  selected,
  onClick,
}: CardOptionProps) {
  return (
    <motion.button
      onClick={() => onClick(id)}
      className={`w-full p-4 rounded-lg border-2 text-left transition-smooth ${
        selected
          ? 'bg-accent/10 border-accent'
          : 'bg-card border-border hover:border-border-md'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="font-medium">{label}</div>
      {description && (
        <div className="text-sm text-txt-mid mt-1">{description}</div>
      )}
    </motion.button>
  )
}
